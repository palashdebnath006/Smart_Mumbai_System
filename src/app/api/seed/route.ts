import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    // Create demo admin user
    const hashedPassword = await hashPassword('admin123');
    
    const adminExists = await db.user.findUnique({
      where: { email: 'admin@smartcity.gov' },
    });
    
    if (!adminExists) {
      await db.user.create({
        data: {
          email: 'admin@smartcity.gov',
          password: hashedPassword,
          name: 'Admin User',
          role: 'admin',
          department: 'City Administration',
        },
      });
    }

    // Create demo citizen user
    const citizenExists = await db.user.findUnique({
      where: { email: 'citizen@smartcity.gov' },
    });
    
    if (!citizenExists) {
      const citizenPassword = await hashPassword('citizen123');
      await db.user.create({
        data: {
          email: 'citizen@smartcity.gov',
          password: citizenPassword,
          name: 'John Citizen',
          role: 'citizen',
        },
      });
    }

    // Create traffic sensors
    const trafficSensors = [
      { name: 'Main Street Sensor', location: 'Main St & 1st Ave', latitude: 40.7128, longitude: -74.006 },
      { name: 'Downtown Sensor', location: 'Downtown Plaza', latitude: 40.7138, longitude: -74.007 },
      { name: 'Highway Entry', location: 'Highway 101 Entry', latitude: 40.7148, longitude: -74.008 },
      { name: 'Industrial Zone', location: 'Industrial Park', latitude: 40.7158, longitude: -74.009 },
      { name: 'Residential Area', location: 'Oak Street', latitude: 40.7168, longitude: -74.01 },
    ];

    for (const sensor of trafficSensors) {
      const exists = await db.trafficSensor.findFirst({
        where: { name: sensor.name },
      });
      if (!exists) {
        await db.trafficSensor.create({ data: sensor });
      }
    }

    // Create environmental sensors
    const envSensors = [
      { name: 'Central Park AQI', type: 'aqi', location: 'Central Park', latitude: 40.7829, longitude: -73.9654 },
      { name: 'Downtown AQI', type: 'aqi', location: 'Downtown', latitude: 40.7128, longitude: -74.006 },
      { name: 'Industrial Zone AQI', type: 'aqi', location: 'Industrial Park', latitude: 40.7200, longitude: -74.0200 },
      { name: 'City Weather Station', type: 'weather', location: 'City Hall', latitude: 40.7127, longitude: -74.0059 },
    ];

    for (const sensor of envSensors) {
      const exists = await db.environmentalSensor.findFirst({
        where: { name: sensor.name },
      });
      if (!exists) {
        await db.environmentalSensor.create({ data: sensor });
      }
    }

    // Create water reservoirs
    const reservoirs = [
      { name: 'Main Reservoir', location: 'North Hills', latitude: 40.75, longitude: -73.98, capacity: 5000, currentLevel: 3200, status: 'normal' },
      { name: 'East Side Tank', location: 'East District', latitude: 40.73, longitude: -73.95, capacity: 2000, currentLevel: 1100, status: 'normal' },
      { name: 'South Reservoir', location: 'South Valley', latitude: 40.70, longitude: -74.02, capacity: 3000, currentLevel: 800, status: 'low' },
    ];

    for (const reservoir of reservoirs) {
      const exists = await db.waterReservoir.findFirst({
        where: { name: reservoir.name },
      });
      if (!exists) {
        await db.waterReservoir.create({ data: reservoir });
      }
    }

    // Create emergency services
    const emergencyServices = [
      { name: 'Central Police Station', type: 'police', location: 'Downtown', latitude: 40.7128, longitude: -74.006, phone: '911', status: 'available' },
      { name: 'Fire Station #1', type: 'fire', location: 'Main St', latitude: 40.7150, longitude: -74.008, phone: '911', status: 'available' },
      { name: 'City Hospital', type: 'ambulance', location: 'Medical District', latitude: 40.7180, longitude: -74.010, phone: '911', status: 'available' },
      { name: 'Disaster Management Center', type: 'disaster_management', location: 'City Center', latitude: 40.7130, longitude: -74.007, phone: '911', status: 'available' },
    ];

    for (const service of emergencyServices) {
      const exists = await db.emergencyService.findFirst({
        where: { name: service.name },
      });
      if (!exists) {
        await db.emergencyService.create({ data: service });
      }
    }

    // Create CCTV cameras
    const cctvCameras = [
      { name: 'Main St Junction', location: 'Main St & 1st Ave', latitude: 40.7128, longitude: -74.006, status: 'online' },
      { name: 'Downtown Plaza', location: 'Central Plaza', latitude: 40.7138, longitude: -74.007, status: 'online' },
      { name: 'Train Station', location: 'Central Station', latitude: 40.7527, longitude: -73.9772, status: 'online' },
      { name: 'Market Area', location: 'City Market', latitude: 40.7148, longitude: -74.008, status: 'maintenance' },
    ];

    for (const camera of cctvCameras) {
      const exists = await db.cCTVCamera.findFirst({
        where: { name: camera.name },
      });
      if (!exists) {
        await db.cCTVCamera.create({ data: camera });
      }
    }

    // Create news items
    const newsItems = [
      { title: 'New Smart Traffic System Launches', content: 'The city has deployed a new AI-powered traffic management system to reduce congestion by 30%.', category: 'government', author: 'City Admin', isPinned: true },
      { title: 'Water Conservation Initiative', content: 'Residents are encouraged to reduce water usage as reservoir levels drop below 50%.', category: 'policy', author: 'Water Department', isPinned: false },
      { title: 'Air Quality Alert: Moderate Levels', content: 'AQI has reached moderate levels. Sensitive groups should limit outdoor activities.', category: 'incident', author: 'Environmental Dept', isPinned: false },
      { title: 'New Public Transport Routes', content: 'Three new bus routes will be added to improve connectivity in residential areas.', category: 'government', author: 'Transport Authority', isPinned: false },
      { title: 'Road Closure: Main Street', content: 'Main Street will be closed for repairs from June 15-20. Please use alternate routes.', category: 'incident', author: 'Traffic Dept', isPinned: true },
    ];

    for (const news of newsItems) {
      const exists = await db.news.findFirst({
        where: { title: news.title },
      });
      if (!exists) {
        await db.news.create({ data: news });
      }
    }

    // Create government schemes
    const schemes = [
      { name: 'Smart City Initiative', description: 'A comprehensive program to digitize city services and improve citizen engagement.', category: 'infrastructure', status: 'active', eligibility: 'All residents', benefits: 'Access to digital services, real-time updates' },
      { name: 'Green Energy Subsidy', description: 'Subsidies for installing solar panels and energy-efficient appliances.', category: 'welfare', status: 'active', eligibility: 'Homeowners', benefits: 'Up to 50% subsidy on installation costs' },
      { name: 'Free Health Camps', description: 'Monthly free health checkup camps in all districts.', category: 'health', status: 'active', eligibility: 'All residents', benefits: 'Free health screenings and consultations' },
    ];

    for (const scheme of schemes) {
      const exists = await db.governmentScheme.findFirst({
        where: { name: scheme.name },
      });
      if (!exists) {
        await db.governmentScheme.create({ data: scheme });
      }
    }

    // Create parking lots
    const parkingLots = [
      { name: 'Central Plaza Parking', location: 'Downtown', latitude: 40.7128, longitude: -74.006, totalSpaces: 200, availableSpaces: 45, hourlyRate: 5.0, status: 'open' },
      { name: 'Mall Parking', location: 'Shopping District', latitude: 40.7150, longitude: -74.008, totalSpaces: 500, availableSpaces: 120, hourlyRate: 3.0, status: 'open' },
      { name: 'Train Station Parking', location: 'Central Station', latitude: 40.7527, longitude: -73.9772, totalSpaces: 300, availableSpaces: 0, hourlyRate: 4.0, status: 'full' },
    ];

    for (const lot of parkingLots) {
      const exists = await db.parkingLot.findFirst({
        where: { name: lot.name },
      });
      if (!exists) {
        await db.parkingLot.create({ data: lot });
      }
    }

    // Create system alerts
    const alerts = [
      { type: 'traffic', title: 'High Congestion Alert', message: 'Heavy traffic detected on Main Street. Consider alternate routes.', severity: 'warning' },
      { type: 'environment', title: 'Air Quality Notice', message: 'AQI is approaching unhealthy levels in Industrial Zone.', severity: 'info' },
      { type: 'water', title: 'Low Reservoir Level', message: 'South Reservoir at 27% capacity. Conservation advised.', severity: 'warning' },
    ];

    for (const alert of alerts) {
      const exists = await db.systemAlert.findFirst({
        where: { title: alert.title },
      });
      if (!exists) {
        await db.systemAlert.create({ data: alert });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
