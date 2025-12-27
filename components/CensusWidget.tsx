import React, { useEffect, useState } from 'react';
import { Users, Globe, Loader2, MapPin } from 'lucide-react';
import { FiveMServerData } from '../types';
import { fetchServerData } from '../services/fivemService';

const CensusWidget: React.FC = () => {
    const [serverData, setServerData] = useState<FiveMServerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // PLACEHOLDER SERVER ID - User can replace this with their actual Cfx.re ID
    const SERVER_ID = 'xvaa3r';

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await fetchServerData(SERVER_ID);
                setServerData(data);
                setError(null);
            } catch (err) {
                console.error('Census Widget Error:', err);
                setError('Сбой связи');
            } finally {
                setLoading(false);
            }
        };

        loadData();
        const interval = setInterval(loadData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    if (loading && !serverData) {
        return (
            <div className="bg-[#f4f1ea] border-4 border-[#4b3634] p-4 text-center animate-pulse">
                <Loader2 className="animate-spin mx-auto text-[#4b3634] mb-2" size={24} />
                <p className="font-serif-body text-xs uppercase tracking-widest text-[#4b3634]">Загрузка данных переписи...</p>
            </div>
        );
    }

    const isOnline = !!serverData;
    const clients = serverData?.clients || 0;
    const maxClients = serverData?.sv_maxclients || 0;
    const projectName = serverData?.vars?.sv_projectName || 'Округ Блейн';

    return (
        <div className="bg-[#f4f1ea] border-4 border-[#4b3634] p-1 shadow-md transform">
            <div className="border border-[#4b3634] p-3">
                {/* Header */}
                <div className="text-center border-b-2 border-[#4b3634] pb-2 mb-3">
                    <h3 className="font-headline font-bold text-lg uppercase leading-tight text-[#4b3634]">
                        Государственный Доклад
                    </h3>
                    <p className="text-[10px] font-serif-body italic text-[#4b3634]/70 uppercase tracking-tighter">
                        Департамент переписи населения округа Блейн
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white/50 p-2 border border-[#4b3634]/20">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-[#4b3634]" />
                            <span className="font-headline font-bold text-sm uppercase text-[#4b3634]">Население:</span>
                        </div>
                        <span className="font-brand text-xl text-[#4b3634]">
                            {isOnline ? `${clients} / ${maxClients}` : 'Н/Д'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#4b3634]/60">
                            <MapPin size={10} />
                            <span>Статус:</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                {isOnline ? 'Округ открыт' : 'Карантин'}
                            </span>
                        </div>
                    </div>

                    {isOnline && (
                        <a
                            href={`fivem://connect/${serverData.connectEndPoints[0]}`}
                            className="block w-full text-center bg-[#4b3634] hover:bg-[#5d4341] text-[#faf8f3] font-headline font-bold py-2 px-4 uppercase tracking-widest text-xs transition-colors shadow-sm"
                        >
                            Отправиться в округ
                        </a>
                    )}

                    {!isOnline && !loading && (
                        <div className="text-center p-2 bg-red-50 text-red-900 text-[10px] font-serif-body italic border border-red-200">
                            Связь с сервером прервана. Возможно, ведутся технические работы или нападение пришельцев.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-3 pt-2 border-t border-[#4b3634]/20 text-[8px] text-[#4b3634]/50 font-sans uppercase text-center leading-none">
                    Данные обновляются в реальном времени. <br />
                    &copy; 2025 BLAINE COUNTY GOV.
                </div>
            </div>
        </div>
    );
};

export default CensusWidget;
