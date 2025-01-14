import Image from "next/image";
import searchLens from "public/search_lens.svg";

const SearchBar = () => {
  return (
    <div className="relative w-full h-[37px] text-text-black">
      <input
        className="w-full h-full pl-10 pr-2 rounded-lg outline-none"
        type="text"
      />
      <Image
        className="absolute left-2 top-1/2 transform -translate-y-1/2"
        src={searchLens}
        alt="검색"
      />
    </div>
  );
};

export default SearchBar;
