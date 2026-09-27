import { useState } from 'react';
import './RecipeCard.css';

const DIFFICULTY_LABELS = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

function RecipeCard({ recipe }) {
  const [imageError, setImageError] = useState(false);

  return (
    <article className="recipe-card">
      <div className="recipe-card__media">
        {recipe.image && !imageError ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="recipe-card__image"
            draggable={false}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="recipe-card__placeholder" aria-hidden="true">
            🍽️
          </div>
        )}
        {recipe.category_name && <span className="recipe-card__category">{recipe.category_name}</span>}
        {recipe.difficulty && (
          <span className={`recipe-card__difficulty recipe-card__difficulty--${recipe.difficulty}`}>
            {DIFFICULTY_LABELS[recipe.difficulty] || recipe.difficulty}
          </span>
        )}
      </div>

      <div className="recipe-card__body">
        <h3 className="recipe-card__title">{recipe.title}</h3>

        <div className="recipe-card__meta">
          {recipe.chef_name && 
            <span className="recipe-card__chef">by {recipe.chef_name}
              <span>
                {typeof recipe.chef_rating === 'number' && (
                  <div className="recipe-card__rating">
                    ({'★'.repeat(recipe.chef_rating)}
                    {'☆'.repeat(Math.max(0, 5 - recipe.chef_rating))})
                  </div>
                )}
              </span>
            </span>}
          {recipe.time && <span className="recipe-card__time">⏱ {recipe.time}</span>}
        </div>

        {recipe.ingredients.length > 0 && (
          <div className="recipe-card__section">
            <h4>Ingredients</h4>
            <div className="recipe-card__ingredients">
              {recipe.ingredients.map((ingredient, i) => (
                <span key={i}>{ingredient}{i === recipe.ingredients.length - 1 ? '' : ', '}</span>
              ))}
            </div>
          </div>
        )}

        {recipe.instructions && (
          <div className="recipe-card__section">
            <h4>Instructions</h4>
            <p className="recipe-card__instructions">{recipe.instructions}</p>
          </div>
        )}
      </div>
    </article>
  );
}

export default RecipeCard;
