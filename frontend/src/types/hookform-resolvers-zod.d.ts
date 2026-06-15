declare module "@hookform/resolvers/zod/dist/zod.js" {
  import type { Resolver } from "react-hook-form";
  import type { z } from "zod";

  export function zodResolver<T extends z.ZodType>(
    schema: T,
    schemaOptions?: Partial<z.ParseParams>,
    resolverOptions?: {
      mode?: "async" | "sync";
      raw?: boolean;
    }
  ): Resolver<z.infer<T>>;
}
