import styles from './itinerary.module.css';

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className={styles.container}>
            <div className={styles.wrapper}>{children}</div>
        </main>
    );
}
