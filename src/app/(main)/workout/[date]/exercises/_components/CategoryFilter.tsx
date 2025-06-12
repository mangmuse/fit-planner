import { CATEGORYLIST } from "@/constants/filters";
import FilterButton from "./FilterButton";
import { Category } from "@/types/filters";
// TODO: TypeFilter 와의 통합 필요성

type CategoryFilterProps = {
  selectedCategory: Category;
  onClick: (category: Category) => void;
};

const CategoryFilter = ({ selectedCategory, onClick }: CategoryFilterProps) => {
  return (
    <nav data-testid="category-filter">
      <div className="flex gap-1.5 mb-1.5">
        {CATEGORYLIST.slice(0, 4).map((category, idx) => (
          <FilterButton<Category>
            key={`category-${idx}`}
            onClick={onClick}
            isSelected={selectedCategory === category}
            label={category}
          />
        ))}
      </div>
      <div className="flex gap-1.5">
        {CATEGORYLIST.slice(4).map((category, idx) => (
          <FilterButton<Category>
            key={`category-${idx + 4}`}
            onClick={onClick}
            isSelected={selectedCategory === category}
            label={category}
          />
        ))}
      </div>
    </nav>
  );
};

export default CategoryFilter;
