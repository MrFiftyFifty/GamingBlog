import useSWR from "swr";
import * as userApi from "@/lib/api/user";

export function usePublicUser(username: string | null) {
  return useSWR(
    username ? ["user", username] : null,
    () => userApi.getUser(username!)
  );
}

export function useUserTopics(username: string | null) {
  return useSWR(
    username ? ["user/topics", username] : null,
    () => userApi.getUserTopics(username!)
  );
}
