import useSWR, { SWRConfiguration } from "swr";
import api from "@/services/api";

export function useFetch<T = unknown>(key: string | null, config?: SWRConfiguration) {
	const fetcher = async (url: string) => {
		const res = await api.get(url);
		return res.data as T;
	};
	return useSWR<T>(key, key ? fetcher : null, { revalidateOnFocus: false, ...config });
}

export default useFetch;
