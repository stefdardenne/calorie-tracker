import { createDefaultCompositionRoot } from "./application/composition";
import { DomainError } from "./domain/errors";
import type { FoodItem, Unit } from "./domain/models";

const composition = createDefaultCompositionRoot();

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing #app element");
}

app.innerHTML = `
  <h1>Calorie Tracker</h1>
  
  <div id="add-food">
    <h2>Add Food</h2>
    <form id="food-form">
      <label>Name: <input name="name" type="text" required /></label>
      <label>Unit: 
        <select name="unit">
          <option value="g">grams</option>
          <option value="ml">ml</option>
          <option value="piece">piece</option>
        </select>
      </label>
      <label>Base Quantity: <input name="baseQuantity" type="number" min="0.1" step="0.1" value="100" required /></label>
      <label>Carbs: <input name="carbohydrates" type="number" min="0" step="0.1" value="0" required /></label>
      <label>Protein: <input name="proteins" type="number" min="0" step="0.1" value="0" required /></label>
      <label>Fat: <input name="fats" type="number" min="0" step="0.1" value="0" required /></label>
      <button type="submit">Add Food</button>
    </form>
    <p id="food-status"></p>
  </div>

  <div id="foods-list">
    <h2>Saved Foods</h2>
    <p id="foods-empty-state">No foods yet</p>
    <table id="foods-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Base Quantity</th>
          <th>Unit</th>
          <th>Carbs</th>
          <th>Protein</th>
          <th>Fat</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="foods"></tbody>
    </table>
  </div>
`;

const foodForm = document.querySelector<HTMLFormElement>("#food-form")!;
const foodStatus =
  document.querySelector<HTMLParagraphElement>("#food-status")!;
const foodsEmptyState =
  document.querySelector<HTMLParagraphElement>("#foods-empty-state")!;
const foodsTable = document.querySelector<HTMLTableElement>("#foods-table")!;
const foodsTableBody =
  document.querySelector<HTMLTableSectionElement>("#foods")!;

function setStatus(message: string, isError: boolean = false) {
  foodStatus.textContent = message;
  foodStatus.style.color = isError ? "red" : "green";
}

async function refreshFoods() {
  const foods = await composition.listFoodItems();
  if (foods.length === 0) {
    foodsTable.hidden = true;
    foodsEmptyState.hidden = false;
    foodsTableBody.innerHTML = "";
    return;
  }

  foodsEmptyState.hidden = true;
  foodsTableBody.innerHTML = foods
    .map(
      (food) =>
        `<tr id="food-${food.id}"><td>${food.name}</td><td>${food.baseQuantity}</td><td>${food.unit}</td><td>${food.carbohydrates}g</td><td>${food.proteins}g</td><td>${food.fats}g</td><td><button class="delete-btn" data-id="${food.id}">Delete</button></td></tr>`,
    )
    .join("");

  // Attach delete handlers
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = (btn as HTMLButtonElement).getAttribute("data-id");
      if (id) {
        await composition.deleteFoodItem(id);
        await refreshFoods();
      }
    });
  });

  foodsTable.hidden = false;
}

foodForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(foodForm);

  try {
    const food: FoodItem = {
      id: `food-${Date.now()}`,
      name: String(fd.get("name") || ""),
      unit: String(fd.get("unit") || "g") as Unit,
      baseQuantity: Number(fd.get("baseQuantity") || 0),
      carbohydrates: Number(fd.get("carbohydrates") || 0),
      proteins: Number(fd.get("proteins") || 0),
      fats: Number(fd.get("fats") || 0),
    };

    await composition.createFoodItem(food);
    foodForm.reset();
    setStatus("Food added!");
    await refreshFoods();
  } catch (error) {
    const msg =
      error instanceof DomainError
        ? `${error.code}: ${error.message}`
        : String(error);
    setStatus(msg, true);
  }
});

refreshFoods();
