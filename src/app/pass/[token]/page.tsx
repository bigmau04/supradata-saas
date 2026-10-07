import { db } from '@/db';
import { members, memberSubscriptions, gyms, attendances } from '@/db/schema';
import { eq, and, sql, isNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { QRRenderer } from '@/components/QRRenderer';

export default async function PassPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const [memberData] = await db
    .select({
      gymId: members.gymId,
      fullName: members.fullName,
      qrToken: members.qrAccessToken,
      gymName: gyms.name,
      endDate: memberSubscriptions.endDate,
      status: memberSubscriptions.status,
    })
    .from(members)
    .innerJoin(gyms, eq(members.gymId, gyms.id))
    .leftJoin(
      memberSubscriptions,
      and(
        eq(memberSubscriptions.memberId, members.id),
        eq(memberSubscriptions.status, 'active')
      )
    )
    .where(eq(members.qrAccessToken, token))
    .limit(1);

  if (!memberData) return notFound();

  const isActive = memberData.status === 'active' && memberData.endDate && new Date(memberData.endDate) >= new Date(new Date().setHours(0,0,0,0));

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const [{ count: currentOccupancy }] = await db.select({ count: sql<number>`count(*)` })
    .from(attendances)
    .where(
      and(
        eq(attendances.gymId, memberData.gymId),
        sql`${attendances.checkIn} >= ${twoHoursAgo.toISOString()}`,
        isNull(attendances.checkOut)
      )
    );
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-200">
        <div className="bg-blue-600 p-6 text-center text-white">
          <h1 className="text-2xl font-bold">{memberData.gymName}</h1>
          <p className="opacity-80 text-sm mt-1">Carnet Digital</p>
        </div>
        
        <div className="p-8 flex flex-col items-center">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">{memberData.fullName}</h2>
          
          <div className="bg-white p-2 rounded-xl shadow-inner border border-gray-100 mb-6 flex justify-center">
            <QRRenderer value={memberData.qrToken} size={200} />
          </div>
          
          <div className="w-full flex justify-between items-center bg-gray-50 p-4 rounded-lg">
            <span className="text-gray-600 text-sm font-medium">Estado</span>
            {isActive ? (
               <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">Activo</span>
            ) : (
               <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">Inactivo/Vencido</span>
            )}
          </div>
          
          {memberData.endDate && (
            <div className="w-full text-center mt-4 text-sm text-gray-500">
              Vence: {new Date(memberData.endDate).toLocaleDateString('es-CO')}
            </div>
          )}
          
          <div className="w-full mt-6 border-t pt-6">
            <h3 className="text-center text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Ocupación en Vivo</h3>
            <div className={`p-4 rounded-xl flex items-center justify-between shadow-sm border ${
               Number(currentOccupancy) < 15 ? 'bg-green-50 border-green-200 text-green-800' : 
               Number(currentOccupancy) <= 30 ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 
               'bg-red-50 border-red-200 text-red-800'
            }`}>
               <div className="flex items-center gap-3">
                 <div className={`h-3 w-3 rounded-full animate-pulse ${
                    Number(currentOccupancy) < 15 ? 'bg-green-500' : 
                    Number(currentOccupancy) <= 30 ? 'bg-yellow-500' : 
                    'bg-red-500'
                 }`}></div>
                 <span className="font-semibold text-sm">
                   {Number(currentOccupancy) < 15 ? 'Tranquilo' : Number(currentOccupancy) <= 30 ? 'Moderado' : 'Concurrido'}
                 </span>
               </div>
               <div className="font-black text-xl">
                 {Number(currentOccupancy)} <span className="text-xs font-normal opacity-70">personas</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
