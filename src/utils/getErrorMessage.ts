import { AxiosError } from "axios";

export function getErrorMessage(
  error: unknown,
  fallback = "Ocorreu um erro. Tente novamente."
): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data.message.join(", ");
    if (data?.message) return data.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
