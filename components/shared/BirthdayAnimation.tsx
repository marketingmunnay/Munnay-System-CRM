import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface BirthdayAnimationProps {
    users: Array<{ nombres: string; apellidos: string; birthDate?: string | Date }>;
}

export const BirthdayAnimation: React.FC<BirthdayAnimationProps> = ({ users }) => {
    const [showAnimation, setShowAnimation] = useState(false);
    const [birthdayPerson, setBirthdayPerson] = useState<string>('');

    useEffect(() => {
        // Verificar si ya se mostró la animación hoy
        const lastShownDate = localStorage.getItem('lastBirthdayAnimation');
        const today = new Date().toDateString();

        if (lastShownDate === today) {
            return; // Ya se mostró hoy
        }

        // Buscar si hay alguien de cumpleaños hoy
        const todayMonth = new Date().getMonth();
        const todayDay = new Date().getDate();

        const birthdayUser = users.find(user => {
            if (!user.birthDate) return false;
            const birthDate = new Date(user.birthDate);
            return birthDate.getMonth() === todayMonth && birthDate.getDate() === todayDay;
        });

        if (birthdayUser) {
            setBirthdayPerson(`${birthdayUser.nombres} ${birthdayUser.apellidos}`);
            setShowAnimation(true);

            // Lanzar confetti
            const duration = 10 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            function randomInRange(min: number, max: number) {
                return Math.random() * (max - min) + min;
            }

            const interval: any = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    clearInterval(interval);
                    return;
                }

                const particleCount = 50 * (timeLeft / duration);

                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);

            // Ocultar después de 10 segundos
            setTimeout(() => {
                setShowAnimation(false);
                localStorage.setItem('lastBirthdayAnimation', today);
            }, 10000);
        }
    }, [users]);

    if (!showAnimation) return null;

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="text-center animate-bounce-slow">
                <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-12 py-8 rounded-3xl shadow-2xl transform scale-110">
                    <div className="text-7xl mb-4">🎉🎂🎈</div>
                    <h1 className="text-5xl font-bold mb-4 animate-pulse">
                        ¡FELIZ CUMPLEAÑOS!
                    </h1>
                    <p className="text-3xl font-semibold">
                        {birthdayPerson}
                    </p>
                    <div className="text-6xl mt-4">🎊🎁✨</div>
                </div>
            </div>
            
            <style>{`
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(-5%);
                        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
                    }
                    50% {
                        transform: translateY(0);
                        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
                    }
                }
                
                .animate-bounce-slow {
                    animation: bounce-slow 1s infinite;
                }
            `}</style>
        </div>
    );
};
