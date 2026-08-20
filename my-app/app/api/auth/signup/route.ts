import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

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
      business,
    } = body as {
      role?: string;
      fullName?: string;
      email?: string;
      password?: string;
      phone?: string;
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

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const hashedPassword = await bcrypt.hash(password, 12);

    if (role === "admin") {
      const existingStaff = await prisma.staff.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });
      if (existingStaff) {
        return NextResponse.json(
          { message: "An account with this email already exists." },
          { status: 409 }
        );
      }

      const createdUser = await prisma.$transaction(async (tx) => {
        const createdBusiness = await tx.business.create({
          data: {
            businessName: business?.name?.trim() || fullName.trim(),
            businessType: business?.type?.trim() || null,
            businessAddress: business?.address?.trim() || null,
            businessPhone: business?.phone?.trim() || null,
          },
        });

        return tx.staff.create({
          data: {
            businessId: createdBusiness.id,
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "owner",
            phone: phone?.trim() || null,
            needsOnboarding: false,
          },
        });
      });

      return NextResponse.json(
        {
          message: "Account created successfully.",
          user: {
            id: createdUser.id.toString(),
            fullName: createdUser.fullName,
            email: createdUser.email,
            role: createdUser.role,
          },
        },
        { status: 201 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json({ message: "Phone is required for user accounts." }, { status: 400 });
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: { phone: phone.trim() },
      select: { id: true },
    });
    if (existingCustomer) {
      return NextResponse.json(
        { message: "An account with this phone number already exists." },
        { status: 409 }
      );
    }

    const createdUser = await prisma.customer.create({
      data: {
        name: fullName.trim(),
        phone: phone.trim(),
        email: normalizedEmail,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: createdUser.id.toString(),
          fullName: createdUser.name,
          email: createdUser.email,
          role: "user",
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