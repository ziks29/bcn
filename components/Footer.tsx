import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-900 text-[#f4f1ea] py-12 mt-12 border-t-8 border-red-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h2 className="font-brand text-4xl mb-4">Blaine County News</h2>
          <p className="font-serif-body text-zinc-400 text-sm max-w-md">
            Мы приносим вам новости, которые элита Вайнвуда не хочет, чтобы вы слышали.
            Владелец и оператор: Trevor Philips Industries (якобы).
          </p>
        </div>
        
        <div>
          <h3 className="font-headline font-bold text-lg mb-4 uppercase tracking-wider text-red-500">Разделы</h3>
          <ul className="space-y-2 font-serif-body text-sm text-zinc-300">
            <li className="hover:text-white cursor-pointer">Местные новости</li>
            <li className="hover:text-white cursor-pointer">Криминальная хроника</li>
            <li className="hover:text-white cursor-pointer">Некрологи (Ежедневно)</li>
            <li className="hover:text-white cursor-pointer">Объявления</li>
          </ul>
        </div>

        <div>
          <h3 className="font-headline font-bold text-lg mb-4 uppercase tracking-wider text-red-500">Контакты</h3>
          <ul className="space-y-2 font-serif-body text-sm text-zinc-300">
            <li>Инфо: 555-0100</li>
            <li>Реклама: 555-0199</li>
            <li>Юристы: Не беспокоить.</li>
            <li>Адрес: Аэродром Сэнди Шорс, Ангар 2</li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-12 pt-8 border-t border-zinc-800 text-zinc-500 text-xs font-sans">
        &copy; {new Date().getFullYear()} Blaine County News. Не связано с Rockstar Games. Просто пародия.
      </div>
    </footer>
  );
};

export default Footer;