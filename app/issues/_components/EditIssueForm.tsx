'use-client';

import dynamic from 'next/dynamic';
import IssueFormSkeleton from '../_components/IssueFormSkeleton';

const EditIssueForm = dynamic(
    () => import('@/app/issues/_components/IssueForm'),
    {
        ssr: false,
        loading: () => <IssueFormSkeleton />
    }
)

export default EditIssueForm;