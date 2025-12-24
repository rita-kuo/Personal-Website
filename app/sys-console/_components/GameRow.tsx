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
            onClick={() => router.push(`/sys-console/games/${id}`)}
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
                <i
                    className='ri-arrow-right-s-line'
                    style={{ fontSize: '1.125rem' }}
                ></i>
            </td>
        </tr>
    );
}
