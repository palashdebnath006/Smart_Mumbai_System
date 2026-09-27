import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const ONE_HOUR_MS = 60 * 60 * 1000;

type ApiNewsItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  isPinned: boolean;
  publishedAt: string;
  source: 'db' | 'derived';
};

export async function GET() {
  try {
    const now = new Date();

    const [dbNews, schemes, trafficIncidents, waterReservoirs, alerts, latestAQI] = await Promise.all([
      db.news.findMany({
        where: { isPublished: true },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        take: 20,
      }),
      db.governmentScheme.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),
      db.trafficIncident.findMany({
        where: { status: 'active' },
        orderBy: { reportedAt: 'desc' },
        take: 4,
      }),
      db.waterReservoir.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 8,
      }),
      db.systemAlert.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      db.aQIReading.findFirst({
        orderBy: { timestamp: 'desc' },
        include: { sensor: true },
      }),
    ]);

    const newsFromDb: ApiNewsItem[] = dbNews.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      author: item.author || 'City Operations Team',
      isPinned: item.isPinned,
      publishedAt: item.publishedAt.toISOString(),
      source: 'db',
    }));

    const derived: ApiNewsItem[] = [];

    for (const incident of trafficIncidents) {
      derived.push({
        id: `traffic-${incident.id}`,
        title: `Traffic Update: ${incident.type} at ${incident.location}`,
        content: `${incident.description}. Severity: ${incident.severity}. Status: ${incident.status}.`,
        category: 'incident',
        author: 'Traffic Control Room',
        isPinned: incident.severity === 'severe',
        publishedAt: incident.reportedAt.toISOString(),
        source: 'derived',
      });
    }

    const criticalWaterSites = waterReservoirs.filter((site) =>
      ['critical', 'low'].includes(site.status.toLowerCase())
    );

    if (criticalWaterSites.length > 0) {
      const names = criticalWaterSites.slice(0, 3).map((site) => site.name).join(', ');
      derived.push({
        id: `water-${criticalWaterSites.map((s) => s.id).join('-')}`,
        title: 'Water Conservation Advisory',
        content: `Low water levels detected in ${names}. Citizens are advised to reduce non-essential water usage over the next 24 hours.`,
        category: 'policy',
        author: 'Water Department',
        isPinned: true,
        publishedAt: now.toISOString(),
        source: 'derived',
      });
    }

    if (latestAQI) {
      derived.push({
        id: `aqi-${latestAQI.id}`,
        title: `Air Quality Update: ${latestAQI.sensor.location}`,
        content: `Current AQI is ${latestAQI.aqi} (${latestAQI.level}) at ${latestAQI.sensor.name}. PM2.5 is ${latestAQI.pm25.toFixed(1)} ug/m3.`,
        category: 'incident',
        author: 'Environmental Department',
        isPinned: latestAQI.aqi >= 150,
        publishedAt: latestAQI.timestamp.toISOString(),
        source: 'derived',
      });
    }

    for (const alert of alerts) {
      const category = alert.type === 'traffic' || alert.type === 'environment' || alert.type === 'water'
        ? 'incident'
        : 'general';

      derived.push({
        id: `alert-${alert.id}`,
        title: alert.title,
        content: alert.message,
        category,
        author: 'City Alert System',
        isPinned: alert.severity === 'critical',
        publishedAt: alert.createdAt.toISOString(),
        source: 'derived',
      });
    }

    const combinedNews = [...newsFromDb, ...derived]
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return Number(b.isPinned) - Number(a.isPinned);
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      })
      .slice(0, 30);

    return NextResponse.json({
      generatedAt: now.toISOString(),
      refreshEveryMs: ONE_HOUR_MS,
      nextRefreshAt: new Date(now.getTime() + ONE_HOUR_MS).toISOString(),
      news: combinedNews,
      schemes,
    });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to load news updates.' },
      { status: 500 }
    );
  }
}
