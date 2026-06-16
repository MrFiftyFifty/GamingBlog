import useSWR from "swr";
import * as socialApi from "@/lib/api/social";

export function useSocialAccounts() {
  return useSWR("social-accounts", () => socialApi.getSocialAccounts());
}
