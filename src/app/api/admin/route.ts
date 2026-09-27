import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateToken, hashPassword } from '@/lib/auth';

// Helper to check admin authorization
async function checkAdminAuth(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || 
                request.cookies.get('token')?.value;
  
  if (!token) return false;
  
  const user = await validateToken(token);
  return user?.role === 'admin';
}

// Helper to parse request body safely
async function parseBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await parseBody(request);
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { action, module: moduleName, data, id } = body;

    // Handle different modules and actions
    switch (moduleName) {
      // ============================================
      // TRAFFIC MODULE
      // ============================================
      case 'traffic-sensor':
        if (action === 'create') {
          const sensor = await db.trafficSensor.create({
            data: {
              name: data.name,
              location: data.location,
              latitude: data.latitude || 0,
              longitude: data.longitude || 0,
              status: data.status || 'active',
            },
          });
          return NextResponse.json({ success: true, data: sensor });
        }
        break;

      case 'traffic-incident':
        if (action === 'update-status') {
          const incident = await db.trafficIncident.update({
            where: { id },
            data: { status: data.status },
          });
          return NextResponse.json({ success: true, data: incident });
        }
        if (action === 'create') {
          const incident = await db.trafficIncident.create({
            data: {
              type: data.type,
              location: data.location,
              latitude: data.latitude || 0,
              longitude: data.longitude || 0,
              description: data.description,
              severity: data.severity || 'minor',
            },
          });
          return NextResponse.json({ success: true, data: incident });
        }
        break;

      // ============================================
      // SAFETY MODULE
      // ============================================
      case 'safety-incident':
        if (action === 'create') {
          const incident = await db.incident.create({
            data: {
              type: data.type,
              title: data.title,
              description: data.description,
              location: data.location,
              latitude: data.latitude || 0,
              longitude: data.longitude || 0,
              severity: data.severity || 'low',
            },
          });
          return NextResponse.json({ success: true, data: incident });
        }
        if (action === 'update') {
          const incident = await db.incident.update({
            where: { id },
            data,
          });
          return NextResponse.json({ success: true, data: incident });
        }
        if (action === 'delete') {
          await db.incident.delete({ where: { id } });
          return NextResponse.json({ success: true });
        }
        break;

      case 'emergency-service':
        if (action === 'create') {
          const service = await db.emergencyService.create({
            data: {
              name: data.name,
              type: data.type,
              location: data.location,
              latitude: data.latitude || 0,
              longitude: data.longitude || 0,
              phone: data.phone,
              capacity: data.capacity,
            },
          });
          return NextResponse.json({ success: true, data: service });
        }
        if (action === 'update') {
          const service = await db.emergencyService.update({
            where: { id },
            data,
          });
          return NextResponse.json({ success: true, data: service });
        }
        if (action === 'delete') {
          await db.emergencyService.delete({ where: { id } });
          return NextResponse.json({ success: true });
        }
        break;

      case 'cctv-camera':
        if (action === 'create') {
          const camera = await db.cCTVCamera.create({
            data: {
              name: data.name,
              location: data.location,
              latitude: data.latitude || 0,
              longitude: data.longitude || 0,
              status: data.status || 'online',
            },
          });
          return NextResponse.json({ success: true, data: camera });
        }
        if (action === 'update') {
          const camera = await db.cCTVCamera.update({
            where: { id },
            data,
          });
          return NextResponse.json({ success: true, data: camera });
        }
        if (action === 'delete') {
          await db.cCTVCamera.delete({ where: { id } });
          return NextResponse.json({ success: true });
        }
        break;

      // ============================================
      // WATER MODULE
      // ============================================
      case 'water-reservoir':
        if (action === 'update') {
          const reservoir = await db.waterReservoir.update({
            where: { id },
            data: {
              capacity: data.capacity,
              currentLevel: data.currentLevel,
              status: data.status,
            },
          });
          return NextResponse.json({ success: true, data: reservoir });
        }
        break;

      case 'water-leak':
        if (action === 'create') {
          const leak = await db.waterLeak.create({
            data: {
              location: data.location,
              latitude: data.latitude || 0,
              longitude: data.longitude || 0,
              severity: data.severity || 'minor',
            },
          });
          return NextResponse.json({ success: true, data: leak });
        }
        if (action === 'update') {
          const leak = await db.waterLeak.update({
            where: { id },
            data,
          });
          return NextResponse.json({ success: true, data: leak });
        }
        if (action === 'delete') {
          await db.waterLeak.delete({ where: { id } });
          return NextResponse.json({ success: true });
        }
        break;

      // ============================================
      // NEWS MODULE
      // ============================================
      case 'news':
        if (action === 'create') {
          const news = await db.news.create({
            data: {
              title: data.title,
              content: data.content,
              category: data.category,
              author: data.author,
              isPinned: data.isPinned || false,
            },
          });
          return NextResponse.json({ success: true, data: news });
        }
        if (action === 'update') {
          const news = await db.news.update({
            where: { id },
            data,
          });
          return NextResponse.json({ success: true, data: news });
        }
        if (action === 'delete') {
          await db.news.delete({ where: { id } });
          return NextResponse.json({ success: true });
        }
        break;

      case 'government-scheme':
        if (action === 'create') {
          const scheme = await db.governmentScheme.create({
            data: {
              name: data.name,
              description: data.description,
              category: data.category,
              eligibility: data.eligibility,
              benefits: data.benefits,
            },
          });
          return NextResponse.json({ success: true, data: scheme });
        }
        if (action === 'update') {
          const scheme = await db.governmentScheme.update({
            where: { id },
            data,
          });
          return NextResponse.json({ success: true, data: scheme });
        }
        if (action === 'delete') {
          await db.governmentScheme.delete({ where: { id } });
          return NextResponse.json({ success: true });
        }
        break;

      // ============================================
      // WASTE MODULE
      // ============================================
      case 'waste-truck':
        if (action === 'create') {
          const truck = await db.wasteTruck.create({
            data: {
              plateNumber: data.plateNumber,
              driverName: data.driverName,
              route: data.route,
            },
          });
          return NextResponse.json({ success: true, data: truck });
        }
        if (action === 'update') {
          const truck = await db.wasteTruck.update({
            where: { id },
            data,
          });
          return NextResponse.json({ success: true, data: truck });
        }
        if (action === 'delete') {
          await db.wasteTruck.delete({ where: { id } });
          return NextResponse.json({ success: true });
        }
        break;

      // ============================================
      // PARKING MODULE
      // ============================================
      case 'parking-lot':
        if (action === 'create') {
          const lot = await db.parkingLot.create({
            data: {
              name: data.name,
              location: data.location,
              latitude: data.latitude || 0,
              longitude: data.longitude || 0,
              totalSpaces: data.totalSpaces,
              availableSpaces: data.availableSpaces || data.totalSpaces,
              hourlyRate: data.hourlyRate,
            },
          });
          return NextResponse.json({ success: true, data: lot });
        }
        if (action === 'update') {
          const lot = await db.parkingLot.update({
            where: { id },
            data,
          });
          return NextResponse.json({ success: true, data: lot });
        }
        if (action === 'delete') {
          await db.parkingLot.delete({ where: { id } });
          return NextResponse.json({ success: true });
        }
        break;

      // ============================================
      // USER MANAGEMENT MODULE
      // ============================================
      case 'users':
        if (action === 'create') {
          // Check if email already exists
          const existingUser = await db.user.findUnique({ where: { email: data.email } });
          if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
          }
          const hashedPw = await hashPassword(data.password);
          const newUser = await db.user.create({
            data: {
              email: data.email,
              password: hashedPw,
              name: data.name,
              role: data.role || 'citizen',
              department: data.department || null,
            },
          });
          return NextResponse.json({
            success: true,
            data: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, department: newUser.department, isActive: newUser.isActive, createdAt: newUser.createdAt },
          });
        }
        if (action === 'update') {
          const updateData: any = {};
          if (data.name) updateData.name = data.name;
          if (data.role) updateData.role = data.role;
          if (data.department !== undefined) updateData.department = data.department;
          if (data.isActive !== undefined) updateData.isActive = data.isActive;
          if (data.password) updateData.password = await hashPassword(data.password);

          const updatedUser = await db.user.update({
            where: { id },
            data: updateData,
          });
          return NextResponse.json({
            success: true,
            data: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role, department: updatedUser.department, isActive: updatedUser.isActive },
          });
        }
        if (action === 'delete') {
          // Delete related sessions first
          await db.session.deleteMany({ where: { userId: id } });
          await db.user.delete({ where: { id } });
          return NextResponse.json({ success: true });
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unknown module: ${moduleName}` },
          { status: 400 }
        );
    }

    return NextResponse.json(
      { error: `Unknown action: ${action} for module: ${moduleName}` },
      { status: 400 }
    );
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch admin data
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const moduleName = searchParams.get('module');

    switch (moduleName) {
      case 'traffic-sensors':
        const sensors = await db.trafficSensor.findMany();
        return NextResponse.json({ data: sensors });

      case 'traffic-incidents':
        const incidents = await db.trafficIncident.findMany();
        return NextResponse.json({ data: incidents });

      case 'safety-incidents':
        const safetyIncidents = await db.incident.findMany();
        return NextResponse.json({ data: safetyIncidents });

      case 'emergency-services':
        const services = await db.emergencyService.findMany();
        return NextResponse.json({ data: services });

      case 'cctv-cameras':
        const cameras = await db.cCTVCamera.findMany();
        return NextResponse.json({ data: cameras });

      case 'water-reservoirs':
        const reservoirs = await db.waterReservoir.findMany();
        return NextResponse.json({ data: reservoirs });

      case 'water-leaks':
        const leaks = await db.waterLeak.findMany();
        return NextResponse.json({ data: leaks });

      case 'news':
        const news = await db.news.findMany({ orderBy: { publishedAt: 'desc' } });
        return NextResponse.json({ data: news });

      case 'government-schemes':
        const schemes = await db.governmentScheme.findMany();
        return NextResponse.json({ data: schemes });

      case 'waste-trucks':
        const trucks = await db.wasteTruck.findMany();
        return NextResponse.json({ data: trucks });

      case 'parking-lots':
        const lots = await db.parkingLot.findMany();
        return NextResponse.json({ data: lots });

      case 'users':
        const users = await db.user.findMany({
          select: { id: true, email: true, name: true, role: true, department: true, isActive: true, createdAt: true, lastLoginAt: true },
          orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ data: users });

      default:
        return NextResponse.json(
          { error: `Unknown module: ${moduleName}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
