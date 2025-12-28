import { ImageResponse } from 'next/og';
import { gethouseById } from '@/lib/dbFunctions';

export const runtime = 'nodejs'; // Use Node.js runtime to access MongoDB directly

export const alt = 'hawwel property preview';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

interface House {
  title: string;
  location: string;
  pricePerDay: number;
  images: string[];
}

export default async function Image({ params }: { params: { houseId: string; locale: string } }) {
  const { houseId } = params;
  const house = (await gethouseById(houseId)) as unknown as House | null;

  if (!house) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Property Not Found
        </div>
      ),
      { ...size }
    );
  }

  const primaryImage = house.images?.[0] || 'https://hawwel-resolve.vercel.app/placeholder.png';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          backgroundColor: '#1c73a1',
          position: 'relative',
        }}
      >
        {/* Background Image */}
        <img
          src={primaryImage}
          alt={house.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
          }}
        />

        {/* Content Container */}
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '60px',
                width: '100%',
                position: 'relative',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ backgroundColor: '#1c73a1', color: 'white', padding: '8px 16px', borderRadius: '12px', fontSize: '24px', fontWeight: 'bold' }}>
                    {house.pricePerDay} TND / Night
                </div>
            </div>

            <h1 style={{ fontSize: '72px', color: 'white', fontWeight: 900, margin: '0 0 10px 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                {house.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', color: '#e2e8f0', fontSize: '32px' }}>
                <span style={{ marginRight: '10px' }}>📍</span>
                <span>{house.location}</span>
            </div>
        </div>

        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '12px 24px',
            borderRadius: '50px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          }}
        >
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#1c73a1' }}>hawwel</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
