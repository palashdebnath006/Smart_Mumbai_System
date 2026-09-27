import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createUser, getUserByEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, name, role } = body;

    // Login
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const result = await authenticateUser(email, password);
      if (!result) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        user: result.user,
        token: result.token,
      });
    }

    // Register
    if (action === 'register') {
      if (!email || !password || !name) {
        return NextResponse.json(
          { error: 'Email, password, and name are required' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }

      const user = await createUser(email, password, name, role || 'citizen');
      
      // Auto-login after registration
      const result = await authenticateUser(email, password);
      
      return NextResponse.json({
        user: result?.user || user,
        token: result?.token,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
