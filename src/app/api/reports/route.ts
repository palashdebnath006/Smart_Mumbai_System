import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateToken } from '@/lib/auth';

// Helper to get user from token
async function getUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;
  if (!token) return null;
  return validateToken(token);
}

// POST — Citizens submit reports; Admins manage reports
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // ─── Citizen: submit a new report ──────────────────────────────────
    if (action === 'create') {
      const { title, category, location, message } = body;

      if (!title || !message) {
        return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
      }

      const report = await db.citizenReport.create({
        data: {
          type: category || 'complaint',
          title,
          description: message,
          location: location || null,
          reporterId: user.id,
          status: 'submitted',
        },
      });

      return NextResponse.json({ success: true, data: report });
    }

    // ─── Admin: update report status ──────────────────────────────────
    if (action === 'update-status' && (user.role === 'admin' || user.role === 'officer')) {
      const { id, status } = body;

      if (!id || !status) {
        return NextResponse.json({ error: 'Report ID and status are required' }, { status: 400 });
      }

      const report = await db.citizenReport.update({
        where: { id },
        data: { status },
      });

      return NextResponse.json({ success: true, data: report });
    }

    // ─── Admin: assign departments to a report ────────────────────────
    if (action === 'assign-departments' && (user.role === 'admin' || user.role === 'officer')) {
      const { id, departments, priority } = body;

      if (!id || !departments || !Array.isArray(departments) || departments.length === 0) {
        return NextResponse.json({ error: 'Report ID and at least one department are required' }, { status: 400 });
      }

      const report = await db.citizenReport.update({
        where: { id },
        data: {
          assignedDepts: departments.join(','),
          priority: priority || 'normal',
          status: 'in_progress',
        },
      });

      // Auto-create a system note about the assignment
      await db.reportNote.create({
        data: {
          reportId: id,
          authorName: user.name,
          authorRole: user.role,
          department: 'admin',
          message: `Report assigned to departments: ${departments.map((d: string) => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}. Priority set to ${priority || 'normal'}.`,
        },
      });

      return NextResponse.json({ success: true, data: report });
    }

    // ─── Department: mark their part as resolved ──────────────────────
    if (action === 'dept-resolve' && (user.role === 'admin' || user.role === 'officer')) {
      const { id, department } = body;

      if (!id || !department) {
        return NextResponse.json({ error: 'Report ID and department are required' }, { status: 400 });
      }

      const report = await db.citizenReport.findUnique({ where: { id } });
      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      // Add this dept to resolvedDepts
      const currentResolved = report.resolvedDepts ? report.resolvedDepts.split(',').filter(Boolean) : [];
      if (!currentResolved.includes(department)) {
        currentResolved.push(department);
      }

      // Check if all assigned depts have resolved
      const assignedDepts = report.assignedDepts ? report.assignedDepts.split(',').filter(Boolean) : [];
      const allResolved = assignedDepts.length > 0 && assignedDepts.every(d => currentResolved.includes(d));

      const updated = await db.citizenReport.update({
        where: { id },
        data: {
          resolvedDepts: currentResolved.join(','),
          status: allResolved ? 'resolved' : 'in_progress',
        },
      });

      // Auto-note
      await db.reportNote.create({
        data: {
          reportId: id,
          authorName: user.name,
          authorRole: user.role,
          department,
          message: allResolved
            ? `${department.charAt(0).toUpperCase() + department.slice(1)} Department has completed their task. All departments have resolved — report is now fully resolved. ✅`
            : `${department.charAt(0).toUpperCase() + department.slice(1)} Department has completed their part of this report.`,
        },
      });

      return NextResponse.json({ success: true, data: updated, allResolved });
    }

    // ─── Add a note (inter-department communication) ──────────────────
    if (action === 'add-note' && (user.role === 'admin' || user.role === 'officer')) {
      const { id, message, department } = body;

      if (!id || !message) {
        return NextResponse.json({ error: 'Report ID and message are required' }, { status: 400 });
      }

      const note = await db.reportNote.create({
        data: {
          reportId: id,
          authorName: user.name,
          authorRole: user.role,
          department: department || null,
          message,
        },
      });

      return NextResponse.json({ success: true, data: note });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Report API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET — Fetch reports. Citizens see their own; Admins see all.
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const deptFilter = searchParams.get('dept');

    const where: any = {};

    // Citizens only see their own reports
    if (user.role === 'citizen') {
      where.reporterId = user.id;
    }

    if (statusFilter && statusFilter !== 'all') {
      where.status = statusFilter;
    }

    // Filter by assigned department
    if (deptFilter && deptFilter !== 'all') {
      where.assignedDepts = { contains: deptFilter };
    }

    const reports = await db.citizenReport.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, name: true, email: true, role: true },
        },
        notes: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: reports });
  } catch (error) {
    console.error('Report fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
