import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-900 text-[#faf8f3] py-12 mt-12 border-t-8 border-[#4b3634]">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h2
            className="font-brand text-4xl mb-4 text-white uppercase italic tracking-widest"
            style={{
              textShadow: `
                -1px 1px 0px #000,
                -2px 2px 0px #000,
                -3px 3px 0px #000,
                -4px 4px 0px #000,
                -5px 5px 0px #000,
                -6px 6px 0px #000
              `,
              WebkitTextStroke: '1.5px #000',
              paintOrder: 'stroke fill',
              letterSpacing: '0.03em',
            }}
          >
            Blaine Gazette
          </h2>
          <p className="font-serif-body text-zinc-400 text-sm max-w-md">
            Мы приносим вам новости, которые элита Вайнвуда не хочет, чтобы вы слышали.
            Владелец и оператор: Trevor Philips Industries (якобы).
          </p>
        </div>

        <div>
          <h3 className="font-headline font-bold text-lg mb-4 uppercase tracking-wider text-amber-600">Контакты</h3>
          <ul className="space-y-2 font-serif-body text-sm text-zinc-300">
            <li>Инфо: 555-0100</li>
            <li>Реклама: 555-0199</li>
            <li>Юристы: Не беспокоить.</li>
            <li>Адрес: Аэродром Сэнди Шорс, Ангар 2</li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-12 pt-8 border-t border-zinc-800 text-zinc-500 text-xs font-sans">
        &copy; {new Date().getFullYear()} Blaine Gazette. Не связано с Rockstar Games. Просто пародия.
      </div>
    </footer>
  );
};

export default Footer;
