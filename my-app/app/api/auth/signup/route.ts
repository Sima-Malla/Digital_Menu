import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { NextResponse } from "next/server";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: connectionString ?? "" }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      role = "user",
      fullName,
      email,
      password,
      phone,
      inviteCode,
      staffRole,
      business,
    } = body as {
      role?: string;
      fullName?: string;
      email?: string;
      password?: string;
      phone?: string;
      inviteCode?: string;
      staffRole?: string;
      business?: {
        name?: string;
        type?: string;
        address?: string;
        phone?: string;
      };
    };

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: "Full name, email, and password are required." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const createdUser = await prisma.users.create({
      data: {
        fullName,
        email,
        password,
        role,
        phone: phone ?? null,
        inviteCode: inviteCode ?? null,
        staffRole: staffRole ?? null,
        businessName: business?.name ?? null,
        businessType: business?.type ?? null,
        businessAddress: business?.address ?? null,
        businessPhone: business?.phone ?? null,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: createdUser.id,
          fullName: createdUser.fullName,
          email: createdUser.email,
          role: createdUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Unable to create account right now." },
      { status: 500 }
    );
  }
}
