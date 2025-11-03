"use client";
import { Skeleton } from '@/app/components';
import { Issue, User } from '@prisma/client';
import { Select } from "@radix-ui/themes";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const AssigneeSelect = ({ issue }: { issue: Issue }) => {
    const { data: users, error, isLoading } = useUsers()

    if (isLoading) return <Skeleton height="32px" />;

    if (error) return <div className="text-sm text-red-600">Failed to load users</div>;

    const initial = issue.assignedToUserId ? String(issue.assignedToUserId) : "";

    const assignIssue = (userId: string) => {
        axios.patch(`/api/issues/${issue.id}`, {
            assignedToUserId: userId || null
        }).catch(() => {
            toast.error('Changes could not be saved');
        });
    }

    return (
        <>
            <Select.Root
                defaultValue={initial}
                onValueChange={assignIssue}
            >
                <Select.Trigger />
                <Select.Content>
                    <Select.Group>
                        <Select.Label>Suggestions</Select.Label>
                        <Select.Item value="">
                            Unassigned
                        </Select.Item>
                        {users?.map((user) => (
                            <Select.Item key={user.id} value={String(user.id)}>
                                {user.name}
                            </Select.Item>
                        ))}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
            <Toaster />
        </>
    );
};

const useUsers = () => useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => axios.get('/api/users').then(res => res.data),
    staleTime: 60000,
    retry: 3,
});


export default AssigneeSelect;



// "use client";
// import { User } from '@prisma/client';
// import { Select } from "@radix-ui/themes";
// import { useQuery } from '@tanstack/react-query';
// import { Skeleton } from '@/app/components';
// import axios from 'axios';

// const AssigneeSelect = () => {
//     const { data: users, error, isLoading } = useQuery<User[]>({
//         queryKey: ['users'],
//         queryFn: () => axios.get('/api/users').then(res => res.data),
//         staleTime: 60000,
//         retry: 3,
//     });

//     if (isLoading) return <Skeleton height='32px' />

//     if (error) return null

//     // const [users, setUsers] = useState<User[]>([]);

//     // useEffect(() => {
//     //     const fetchUsers = async () => {
//     //         const { data } = await axios.get<User[]>('/api/users');
//     //         setUsers(data);
//     //     }
//     //     fetchUsers()
//     // }, [])

//     return (
//         <Select.Root>
//             <Select.Trigger ><Select.Value placeholder="Assign..." /></Select.Trigger>
//             <Select.Content>
//                 <Select.Group>
//                     <Select.Label>
//                         Suggestions
//                     </Select.Label>
//                     {users!.map(user => <Select.Item key={user.id} value={user.id}>{user.name}</Select.Item>)}

//                 </Select.Group>
//             </Select.Content>
//         </Select.Root>
//     )
// }

// export default AssigneeSelect