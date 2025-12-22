'use client';

import { useRouter } from 'next/navigation';

type Props = {
    id: number;
    name: string;
    updatedAt: string;
};

export default function GameRow({ id, name, updatedAt }: Props) {
    const router = useRouter();

    return (
        <tr
            onClick={() => router.push(`/sys-console/game/${id}`)}
            style={{ cursor: 'pointer' }}
            className='game-row'
        >
            <td>
                <strong>{name}</strong>
            </td>
            <td
                style={{
                    textAlign: 'right',
                    color: 'var(--pico-muted-color)',
                    fontSize: '0.85rem',
                }}
            >
                {updatedAt}
            </td>
            <td
                style={{
                    width: '40px',
                    textAlign: 'center',
                    color: 'var(--pico-muted-color)',
                }}
            >
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <polyline points='9 18 15 12 9 6'></polyline>
                </svg>
            </td>
        </tr>
    );
}
