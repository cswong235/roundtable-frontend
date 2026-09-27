import { useEffect, useState } from "react";
import DepthCarousel from './components/DepthCarousel';
import RecipeCard from './components/RecipeCard';
import TagInput from './components/TagInput';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import './App.css';
import logo from './assets/Roundtable.png'

const API = {
  recipes: "https://roundtable-backend-production-9dfe.up.railway.app/recipes",
  // recipeById: "https://roundtable-backend-production-9dfe.up.railway.app/recipes/1",
  createRecipe: "https://roundtable-backend-production-9dfe.up.railway.app/recipes",

  users: "https://roundtable-backend-production-9dfe.up.railway.app/users",
  createUser: "https://roundtable-backend-production-9dfe.up.railway.app/users",

  categories: "https://roundtable-backend-production-9dfe.up.railway.app/categories",
};

function Recipes({ recipes, loading }) {
  return (
    <Container className="recipes-panel">
      <h2 className="section-title">Recipes ({recipes.length})</h2>
      <div className="recipes-panel__stage" style={{ height: '700px', position: 'relative' }}>
        {loading ? ( 
          <div className="diner-loading">
            <Spinner className="diner-loading__spinner" animation="border" role="status"/>
            <span className="diner-loading__text">Loading...</span>
          </div>
        ) : recipes.length === 0 ? (
          <div className="menu-card menu-card--compact">
            <h3 className="section-title section-title--card">No records found</h3>
            <p className="menu-card__label mb-0">Try adding a recipe!</p>
          </div>
        ) : (
          <DepthCarousel
            items={
              recipes.map((recipe) => ({
                alt: recipe.title,
                content: <RecipeCard recipe={recipe} />,
              }))
            }
            depth={220}
            spread={100}
            tilt={22}
            tiltDirection="right"
            perspective={1400}
            visibleCards={10}
            falloff={0.2}
            blur={6}
            autoplay={false}
            loop
            cardWidth={500}
            cardHeight={720}
            radius={18}
            tint="#ab001d"
            duration={700}
            ease="power3.out"
            autoplayDelay={3200}
            showControls
            showIndicators
          />
        )}
      </div>
    </Container>
  );
}

function AddRecipe({ fetchRecipes, authorList, authorsLoading }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [timeLow, setTimeLow] = useState("");
  const [timeHigh, setTimeHigh] = useState("");
  const [timeUnit, setTimeUnit] = useState("minutes");
  const [category, setCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [author, setAuthor] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLoading(true);
    fetch(API.categories)
      .then((response) => response.json())
      .then((data) => setCategoryList(Array.isArray(data) ? data : []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  // Holds all validation checks
  // When the states update, React re-renders the AddRecipe component and this object as well
  // Values are equal to true or false depending on the state of the useStates
  const validation = {
    nameCheck: !name,
    difficultyCheck: !difficulty,
    timeHighCheck: timeLow !== "" && timeHigh !== "" && Number(timeHigh) < Number(timeLow),
    timeUnitCheck: !timeUnit,
    categoryCheck: !category,
    authorCheck: !author,
    ingredientsCheck: ingredients.length === 0,
    instructionsCheck: !instructions,
  }

  const VALIDATION_MESSAGES = {
    nameCheck: "Recipe name is required.",
    difficultyCheck: "Difficulty is required.",
    timeHighCheck: "Max time can't be less than min time.",
    timeUnitCheck: "Time unit is required.",
    categoryCheck: "Category is required.",
    authorCheck: "Author is required.",
    ingredientsCheck: "At least one ingredient is required.",
    instructionsCheck: "Instructions are required.",
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Initialize object to hold errors
    const newErrors = {};
    // Initialize error flag
    let hasErrors = false;
    // For each check inside the validation object
    for (const check in validation) {
      // If an invalid input is detected, the validation returns true.
      // If true, add the new error into the newErrors object alongside the error message
      if (validation[check]) {
        newErrors[check] = VALIDATION_MESSAGES[check];
        hasErrors = true;
      }
    }
    // Set the errors state with the object to display error messages under related fields
    setErrors(newErrors);

    // If errors are still present, block submission
    if (hasErrors) return;

    // Handle time range input
    // Checks for inputs on the upper and lower time range, if both are present, create a formatted string
    // Otherwise, display either one
    const timeRange = timeLow && timeHigh ? `${timeLow} - ${timeHigh}` : timeLow || timeHigh;

    // Add the unit of time to the timeRange
    const time = timeRange ? `${timeRange} ${timeUnit}` : "";

    // Submit recipe to the API
    const response = await fetch(API.createRecipe, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: name,
        image: image,
        difficulty: difficulty,
        time: time,
        category_id: category,
        user_id: author,
        ingredients: ingredients,
        instructions: instructions,
      }),
    });

    // If there's a problem with submission, state the error
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      alert(err.error || "Failed to add recipe.");
      return;
    }

    // Reset all inputs back to default
    setName("");
    setImage("");
    setDifficulty("easy");
    setTimeLow("");
    setTimeHigh("");
    setTimeUnit("minutes");
    setCategory("");
    setAuthor("");
    setIngredients([]);
    setInstructions("");
    setErrors({});

    alert("Recipe added!");

    // Refreshes the carousel to show updated data
    fetchRecipes();
  }

  return (
    <Container className="menu-card">
      <h2 className="section-title section-title--card">Add Recipe</h2>

      <Container className="menu-card__inner">
        <Form className="menu-card__form" onSubmit={handleSubmit}>
          <Row className="menu-card__row">
            <Col className="menu-card__field">
              <Form.Label className="menu-card__label">Recipe Name</Form.Label>
              <Form.Control
                className="diner-input"
                placeholder="Recipe Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              {errors.nameCheck && <Form.Text className="text-danger diner-error">{errors.nameCheck}</Form.Text>}
            </Col>
            <Col className="menu-card__field">
              <Form.Label className="menu-card__label">Image Link</Form.Label>
              <Form.Control
                className="diner-input"
                placeholder="Image Link"
                value={image}
                onChange={(event) => setImage(event.target.value)}
              />
            </Col>
          </Row>

          <Row className="menu-card__row">
            <Col className="menu-card__field">
              <Form.Label className="menu-card__label">Author</Form.Label>
              <Form.Select
                className="diner-input diner-select"
                placeholder="Author"
                value={author}
                disabled={authorsLoading}
                onChange={(event) => setAuthor(event.target.value)}
              >
                {authorsLoading ? (
                  <option className="text-muted" value="">Loading...</option>
                ) : (
                  <>
                    <option value="" disabled>Select an author</option>
                    {authorList.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </>
                )}
              </Form.Select>
              {!authorsLoading && authorList.length === 0 && <Form.Text className="text-danger diner-error">No records found.</Form.Text>}
              {errors.authorCheck &&<Form.Text className="text-danger diner-error">{errors.authorCheck}</Form.Text>}
            </Col>
            <Col className="menu-card__field">
              <Form.Label className="menu-card__label">Category</Form.Label>
              <Form.Select
                className="diner-input diner-select"
                placeholder="Category"
                value={category}
                disabled={loading}
                onChange={(event) => setCategory(event.target.value)}
              >
                {loading ? (
                  <option className="text-muted" value="">Loading...</option>
                ) : (
                  <>
                    <option value="" disabled>Select a category</option>
                    {categoryList.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </>
                )}
              </Form.Select>
              {!loading && categoryList.length === 0 && <Form.Text className="text-danger diner-error">No records found.</Form.Text>}
              {errors.categoryCheck &&<Form.Text className="text-danger diner-error">{errors.categoryCheck}</Form.Text>}
            </Col>
          </Row>

          <Row className="menu-card__row">
            <Col className="menu-card__field">
              <Form.Label className="menu-card__label">Time</Form.Label>
              <div className="d-flex gap-2 time-range">
                <Form.Control
                  className="diner-input time-range__input"
                  placeholder="Min"
                  value={timeLow}
                  onChange={(event) => setTimeLow(event.target.value)}
                />
                to
                <Form.Control
                  className="diner-input time-range__input"
                  placeholder="Max"
                  value={timeHigh}
                  onChange={(event) => setTimeHigh(event.target.value)}
                />
                <Form.Select
                  className="diner-input diner-select time-range__unit"
                  value={timeUnit}
                  onChange={(event) => setTimeUnit(event.target.value)}
                >
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                </Form.Select>
              </div>
              {errors.timeHighCheck && <Form.Text className="text-danger diner-error">{errors.timeHighCheck}</Form.Text>}
              {errors.timeUnitCheck && <Form.Text className="text-danger diner-error">{errors.timeUnitCheck}</Form.Text>}
            </Col>
            <Col className="menu-card__field">
              <Form.Label className="menu-card__label">Difficulty</Form.Label>
              <Form.Select
                className="diner-input diner-select"
                placeholder="Difficulty"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </Form.Select>
              {errors.difficultyCheck && <Form.Text className="text-danger diner-error">{errors.difficultyCheck}</Form.Text>}
            </Col>
          </Row>

          <Form.Label className="menu-card__label">Ingredients</Form.Label>
          <TagInput
            tags={ingredients}
            onChange={setIngredients}
            placeholder="Type an ingredient and press Enter"
          />
          {errors.ingredientsCheck && <Form.Text className="text-danger diner-error">{errors.ingredientsCheck}</Form.Text>}

          <Form.Label className="menu-card__label">Instructions</Form.Label>
          <Form.Control
            className="diner-input"
            as="textarea"
            placeholder="Instructions"
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
          />
          {errors.instructionsCheck && <Form.Text className="text-danger diner-error">{errors.instructionsCheck}</Form.Text>}

          <Button className="diner-btn" type="submit">Add Recipe</Button>
        </Form>
      </Container>
    </Container>
  );
}

function AddUser({ fetchAuthors }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(1);
  const [errors, setErrors] = useState({});

  const validation = {
    nameCheck: !name,
    ratingCheck: !rating,
  }

  const VALIDATION_MESSAGES = {
    nameCheck: "Name is required.",
    ratingCheck: "Rating is required.",
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const newErrors = {};
    let hasErrors = false;
    for (const check in validation) {
      if (validation[check]) {
        newErrors[check] = VALIDATION_MESSAGES[check];
        hasErrors = true;
      }
    }
    setErrors(newErrors);

    if (hasErrors) return;

    await fetch(API.createUser, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        rating,
      }),
    });

    setName("");
    setRating(1);
    setErrors({});

    // Refreshes the author dropdown to show the new user
    fetchAuthors();

    alert("Author added!");
  }

  return (
    <Container className="menu-card menu-card--compact">
      <h2 className="section-title section-title--card">Add Author</h2>

      <Container className="menu-card__inner">
        <Form className="menu-card__form" onSubmit={handleSubmit}>
          <Row className="menu-card__row">
            <Col className="menu-card__field">
              <Form.Label className="menu-card__label">Name</Form.Label>
              <Form.Control
                className="diner-input"
                placeholder="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              {errors.nameCheck && <Form.Text className="text-danger diner-error">{errors.nameCheck}</Form.Text>}
            </Col>
            <Col className="menu-card__field">
              <Form.Label className="menu-card__label">Rating (1-5)</Form.Label>
              <Form.Control
                type="number"
                className="diner-input"
                placeholder="Rating"
                value={rating}
                min={1}
                max={5}
                onChange={(event) => setRating(event.target.value)}
              />
              {errors.ratingCheck && <Form.Text className="text-danger diner-error">{errors.ratingCheck}</Form.Text>}
            </Col>
          </Row>

          <Button className="diner-btn" type="submit">Add Author</Button>
        </Form>
      </Container>
    </Container>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [authorList, setAuthorList] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(true);

  function fetchAuthors() {
    setAuthorsLoading(true);
    fetch(API.users)
      .then((response) => response.json())
      .then((data) => setAuthorList(Array.isArray(data) ? data : []))
      .catch((error) => console.error(error))
      .finally(() => setAuthorsLoading(false));
  }

  function fetchRecipes() {
    setLoading(true);
    fetch(API.recipes)
      .then((response) => response.json())
      .then((data) => setRecipes(Array.isArray(data) ? data : []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchRecipes();
    fetchAuthors();
  }, []);

  return (
    <main className="diner">
      <Container className="d-flex flex-column justify-content-center align-items-center">
        <img className="diner__logo" src={logo} alt="Roundtable logo" height="150px"/>
        <h2 className="section-title">Take some goodness with you anytime, anywhere.</h2>
      </Container>

      <Row className="diner__layout mx-0 g-4">
        <Col xs={6} className="diner__column">
          <Recipes recipes={recipes} loading={loading} />
        </Col>
        <Col xs={6} className="diner__column diner__column--forms">
          <AddRecipe fetchRecipes={fetchRecipes} authorList={authorList} authorsLoading={authorsLoading} />
          <AddUser fetchAuthors={fetchAuthors} />
        </Col>
      </Row>
    </main>
  );
}

export default App;