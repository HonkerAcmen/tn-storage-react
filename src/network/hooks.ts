// import {
//   useQuery,
//   useMutation,
//   useQueryClient,
//   UseQueryOptions,
//   UseMutationOptions,
// } from '@tanstack/react-query';
// import { queryKeys } from './queryClient';
// import request from './http';

// /**
//  * React Query Hooks 配置示例
//  * 提供常用的 query 和 mutation hooks 模板
//  */

// /**
//  * 通用 Query Hook 类型
//  */
// type QueryFunction<T> = () => Promise<T>;

// /**
//  * 通用 Mutation Hook 类型
//  */
// type MutationFunction<TData, TVariables> = (
//   variables: TVariables
// ) => Promise<TData>;

// /**
//  * 通用的 useQuery Hook 包装器
//  * 提供统一的配置和错误处理
//  */
// export function useCustomQuery<TData, TError = Error>(
//   queryKey: unknown[],
//   queryFn: QueryFunction<TData>,
//   options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
// ) {
//   return useQuery<TData, TError>({
//     queryKey,
//     queryFn,
//     ...options,
//   });
// }

// /**
//  * 通用的 useMutation Hook 包装器
//  * 提供统一的配置和错误处理
//  */
// export function useCustomMutation<TData, TError = Error, TVariables = void>(
//   mutationFn: MutationFunction<TData, TVariables>,
//   options?: UseMutationOptions<TData, TError, TVariables>
// ) {
//   const queryClient = useQueryClient();

//   return useMutation<TData, TError, TVariables>({
//     mutationFn,
//     ...options,
//     onSuccess: (data, variables, context) => {
//       // 可以在这里统一处理成功后的逻辑，比如刷新相关查询
//       options?.onSuccess?.(data, variables, context);
//     },
//     onError: (error, variables, context) => {
//       // 可以在这里统一处理错误
//       options?.onError?.(error, variables, context);
//     },
//   });
// }

// /**
//  * 使用示例：
//  *
//  * // Query 示例
//  * const { data, isLoading, error } = useCustomQuery(
//  *   queryKeys.files.tree(),
//  *   async () => {
//  *     const response = await request.get('/files/tree');
//  *     return response;
//  *   },
//  *   {
//  *     staleTime: 5 * 60 * 1000, // 可选：覆盖默认配置
//  *   }
//  * );
//  *
//  * // Mutation 示例
//  * const mutation = useCustomMutation(
//  *   async (fileId: string) => {
//  *     const response = await request.delete(`/files/${fileId}`);
//  *     return response;
//  *   },
//  *   {
//  *     onSuccess: () => {
//  *       queryClient.invalidateQueries({ queryKey: queryKeys.files.all });
//  *     },
//  *   }
//  * );
//  */
