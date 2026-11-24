import React from 'react';

export const FormationGuideSection: React.FC = () => {
  const rows = [
    {
      species: 'Nguyên tử Ca (Z = 20)',
      role: 'Đặt ở giữa · Nhường 2e',
      nucleus: '+20',
      ring2: '2e',
      ring3: '8e',
      ring4: '8e',
      ring5: '2e',
      charge: '0',
    },
    {
      species: 'Nguyên tử Cl (Z = 17)',
      role: 'Đặt hai bên · Mỗi nguyên tử nhận 1e',
      nucleus: '+17',
      ring2: '2e',
      ring3: '8e',
      ring4: '7e',
      ring5: '—',
      charge: '0',
    },
    {
      species: 'Ion Ca²⁺ (sau nhường 2e)',
      role: 'Đặt ở giữa · Đạt lớp vỏ bền vững',
      nucleus: '+20',
      ring2: '2e',
      ring3: '8e',
      ring4: '8e',
      ring5: '—',
      charge: '2+',
    },
    {
      species: '2 Ion Cl⁻ (sau nhận mỗi ion 1e)',
      role: 'Đặt bên cạnh hai bên Ca²⁺',
      nucleus: '+17',
      ring2: '2e',
      ring3: '8e',
      ring4: '8e',
      ring5: '—',
      charge: '1−',
    },
  ];

  return (
    <section id="bang-cau-tao" className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Bảng đối chiếu cấu tạo các vòng tròn trước và sau khi chuyển electron
        </h2>
        <span className="text-xs text-slate-500">
          Bảo toàn tổng electron: 20 + 17 + 17 = 54 electron
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600">
              <th className="py-2.5 pr-4">Hạt / Ion</th>
              <th className="px-3 py-2.5">Vòng 1 (Hạt nhân)</th>
              <th className="px-3 py-2.5">Vòng 2 (Lớp K)</th>
              <th className="px-3 py-2.5">Vòng 3 (Lớp L)</th>
              <th className="px-3 py-2.5">Vòng 4 (Lớp M)</th>
              <th className="px-3 py-2.5">Vòng 5 (Ngoài cùng)</th>
              <th className="pl-3 py-2.5 text-right">Điện tích</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.species} className="hover:bg-slate-50/70">
                <td className="py-3 pr-4">
                  <div className="font-semibold text-slate-900">{row.species}</div>
                  <div className="text-xs text-slate-500">{row.role}</div>
                </td>
                <td className="px-3 py-3 font-mono font-semibold text-slate-900 tabular-nums">
                  {row.nucleus}
                </td>
                <td className="px-3 py-3 font-mono text-slate-700 tabular-nums">{row.ring2}</td>
                <td className="px-3 py-3 font-mono text-slate-700 tabular-nums">{row.ring3}</td>
                <td className="px-3 py-3 font-mono text-slate-700 tabular-nums">{row.ring4}</td>
                <td className="px-3 py-3 font-mono text-slate-700 tabular-nums">{row.ring5}</td>
                <td className="pl-3 py-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                  {row.charge}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div id="quy-tac-octet" className="mt-6 grid gap-6 border-t border-slate-200 pt-5 md:grid-cols-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">1. Quá trình nhường electron của Ca</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Nguyên tử Ca (Z = 20) có 2 electron ở vòng tròn ngoài cùng (lớp thứ 4). Ca nhường 2 electron này để lớp M (8 electron) trở thành lớp ngoài cùng bền vững, tạo ion Ca²⁺.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">2. Quá trình nhận electron của 2 Cl</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Mỗi nguyên tử Cl (Z = 17) có 7 electron ở lớp ngoài cùng nên nhận thêm 1 electron từ Ca để đạt đủ 8 electron lớp ngoài cùng (quy tắc octet), tạo 2 ion Cl⁻ mang điện tích 1−.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">3. Sắp xếp liên kết ion CaCl₂</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Ion Ca²⁺ mang điện tích 2+ đặt ở giữa, hai bên là 2 ion Cl⁻ mang điện tích 1−. Các ion trái dấu hút nhau bằng lực hút tĩnh điện tạo thành tinh thể CaCl₂.
          </p>
        </div>
      </div>
    </section>
  );
};
