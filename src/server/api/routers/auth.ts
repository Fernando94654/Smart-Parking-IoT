import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({
      email: z.string().email("Email inválido"),
      password: z.string().min(1, "La contraseña es requerida"),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        console.log("Login attempt for:", input.email);
        
        const user = await ctx.db.user.findUnique({
          where: { 
            email: input.email
          },
        });

        if (!user) {
          console.log("User not found:", input.email);
          return { 
            success: false, 
            message: "Usuario no encontrado" 
          };
        }

        // Para desarrollo - comparación directa
        // En producción: usar bcrypt.compare
        const isPasswordValid = input.password === user.password;
        
        if (!isPasswordValid) {
          console.log("Invalid password for user:", input.email);
          return { 
            success: false, 
            message: "Contraseña incorrecta" 
          };
        }

        // No devolver la contraseña
        const { password, ...userWithoutPassword } = user;
        
        console.log("Login successful for:", input.email);
        return { 
          success: true, 
          user: userWithoutPassword,
          message: "Login exitoso"
        };
      } catch (error) {
        console.error("Login error:", error);
        return { 
          success: false, 
          message: "Error del servidor. Intenta nuevamente." 
        };
      }
    }),

  register: publicProcedure
    .input(z.object({
      email: z.string().email("Email inválido"),
      password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
      name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
      phone: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        console.log("Registration attempt for:", input.email);

        // Verificar si el usuario ya existe
        const existingUser = await ctx.db.user.findUnique({
          where: { 
            email: input.email
          },
        });

        if (existingUser) {
          console.log("User already exists:", input.email);
          return { 
            success: false, 
            message: "El email ya está registrado" 
          };
        }

        // Crear nuevo usuario
        const user = await ctx.db.user.create({
          data: {
            email: input.email,
            password: input.password, // En producción: hash this!
            name: input.name,
            phone: input.phone,
          },
        });

        // No devolver la contraseña
        const { password, ...userWithoutPassword } = user;
        
        console.log("Registration successful for:", input.email);
        return { 
          success: true, 
          user: userWithoutPassword,
          message: "Usuario registrado exitosamente"
        };
      } catch (error: any) {
        console.error("Registration error:", error);
        
        // Manejar errores específicos de Prisma
        if (error.code === 'P2002') {
          return { 
            success: false, 
            message: "El email ya está registrado" 
          };
        }
        
        return { 
          success: false, 
          message: "Error al crear el usuario. Intenta nuevamente." 
        };
      }
    }),

  // Endpoint de salud para probar la conexión
  health: publicProcedure
    .query(() => {
      return { 
        status: "ok", 
        message: "Auth router is working",
        timestamp: new Date().toISOString()
      };
    }),
});