import { getUserById } from '../../../api/users';
import { useQuery } from "@tanstack/react-query"

const useGetUsers = (userId) => {
    return useQuery({
        queryKey: ["user", userId],
        queryFn: async () => {
            return getUserById(userId)
        },
        enabled: !!userId,
        initialData: {}
    })
}

export default useGetUsers;