export async function supaSafe<T>(promise: Promise<{ data: T | null; error: any }>) {
  const { data, error } = await promise;
  if (error) throw new Error(error.message || 'Request failed');
  return data as T;
}
