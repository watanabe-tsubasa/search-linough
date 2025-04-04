import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";
import { houseData, type HouseData } from "~/types";
import { findBestMatch } from "~/utils";

export const fetchApartments = async (store: string | null) => {
  if (!store) return [];

  return new Promise<HouseData[]>((resolve) => {
    setTimeout(() => {
      const apartments = houseData.filter(
          data => data.store === decodeURIComponent(store ?? "")
        );
      resolve([...new Set(apartments)]);
    }, 1000);
  });
};

export const ApartmentCards = ({
  apartments,
  addressSearchTerm
}: {
  apartments: HouseData[],
  addressSearchTerm: string
}) => {
  const filteredApartments = useMemo(() => {
    if (!addressSearchTerm) return apartments;
  
    return apartments
      .map(apt => {
        const matchScore = findBestMatch(
          addressSearchTerm,
          apt.address,
          apt.apartment
        );

        return { 
          apartment: apt, 
          matchScore
        };
      })
      .filter(({ matchScore }) => matchScore >= 80) // しきい値80
      .sort((a, b) => b.matchScore - a.matchScore) // スコア順にソート
      .map(({ apartment }) => apartment);
  }, [apartments, addressSearchTerm]);

  if (!apartments.length) return <ErrorAccess />

  return(
    <div className="gap-4 grid grid-cols-2">
      {filteredApartments.map((apartment) => (
        <ApartmentCard
         key={`${apartment.post}-${apartment.apartment}`}
         apartment={apartment} 
        />
      ))}
    </div>
  )

}

const ApartmentCard = ({ apartment }: {apartment: HouseData}) => {
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border"
    >
      <h2 className="text-xl font-semibold mb-2">
        {apartment.apartment}
      </h2>
      <p className="text-gray-600">{apartment.address}</p>
      <p className="text-gray-500 text-sm mt-2">
        世帯数: {apartment.households}
      </p>
    </div>
  )
}

/**
 * storeのqueryparametorがおかしいときやマンションが０件のとき表示
 */
const ErrorAccess = () => {
  return(
  <div className="bg-gray-100 p-8">
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        店舗が見つかりません
      </h1>
      <Link
        to="/"
        className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        トップページに戻る
      </Link>
    </div>
  </div>
  )
}

export const FakeApartmentCards = () => {
  return (
    <div className="gap-4 grid grid-cols-2">
      <FakeApartmentCard/>
      <FakeApartmentCard/>
      <FakeApartmentCard/>
      <FakeApartmentCard/>
    </div>
  )
}

const FakeApartmentCard = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" /> {/* タイトル */}
      <div className="h-4 bg-gray-200 rounded w-full mb-2" /> {/* 住所 */}
      <div className="h-4 bg-gray-200 rounded w-1/2 mt-4" /> {/* 世帯数 */}
    </div>
  );
};
