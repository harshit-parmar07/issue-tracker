"use client";

import { User } from '@prisma/client';
import { Select } from "@radix-ui/themes";
// import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, } from '@radix-ui/themes'
// import * as Select from "@radix-ui/react-select";
import axios from 'axios';
import React, { useEffect, useState } from 'react'

const AssigneeSelect = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data } = await axios.get<User[]>('/api/users');
            setUsers(data);
        }
        fetchUsers()
    }, [])

    return (
        <Select.Root>
            <Select.Trigger ><Select.Value placeholder="Assign..." /></Select.Trigger>
            <Select.Content>
                <Select.Group>
                    <Select.Label>
                        Suggestions
                    </Select.Label>
                    {users.map(user => <Select.Item key={user.id} value={user.id}>{user.name}</Select.Item>)}

                </Select.Group>
            </Select.Content>
        </Select.Root>
    )
}

export default AssigneeSelect