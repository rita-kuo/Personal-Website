import styles from './centered-card-layout.module.css';

type CenteredCardLayoutProps = {
    title: string;
    description: string;
    iconClassName?: string;
};

export default function CenteredCardLayout({
    title,
    description,
    iconClassName = 'ri-prohibited-2-line',
}: CenteredCardLayoutProps) {
    return (
        <main className={styles.container}>
            <div className={styles.wrapper}>
                <article className={styles.card}>
                    <i className={`${iconClassName} ${styles.watermark}`} />
                    <div className={styles.cardContent}>
                        <header>
                            <h2 className={styles.title}>{title}</h2>
                        </header>
                        <p className={styles.description}>{description}</p>
                    </div>
                </article>
            </div>
        </main>
    );
}
