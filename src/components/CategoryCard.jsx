import { Link } from 'react-router-dom';
import Icon from './Icon';

export default function CategoryCard({ category, count }) {
  return (
    <Link to={`/categories/${category.key}`} className="category-card">
      {category.image && (
        <img src={category.image} alt="" className="category-card-image" loading="lazy" />
      )}
      <span className="category-card-body">
        <span className="category-card-name">{category.description}</span>
        {category.tagline && <span className="category-card-tagline">{category.tagline}</span>}
        <span className="category-card-cta">
          {count > 0 ? `Ver ${count} ${count === 1 ? 'producto' : 'productos'}` : 'Ver productos'}
          <Icon name="chevronRight" size={18} />
        </span>
      </span>
    </Link>
  );
}
