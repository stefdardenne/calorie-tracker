import { useState } from "react";

import type { Unit } from "../../domain/models";

export interface FoodFormValues {
  name: string;
  unit: Unit;
  baseQuantity: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
}

interface FoodFormProps {
  onSubmit: (values: FoodFormValues) => Promise<boolean>;
}

const initialFormValues: FoodFormValues = {
  name: "",
  unit: "g",
  baseQuantity: 100,
  carbohydrates: 0,
  proteins: 0,
  fats: 0,
};

export function FoodForm({ onSubmit }: FoodFormProps) {
  const [values, setValues] = useState<FoodFormValues>(initialFormValues);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const didCreate = await onSubmit(values);
    if (didCreate) {
      setValues(initialFormValues);
    }
  }

  function updateField<Key extends keyof FoodFormValues>(
    key: Key,
    value: FoodFormValues[Key],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  return (
    <section className="panel">
      <h2>Add Food</h2>
      <form className="food-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            required
            type="text"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </label>
        <label>
          Unit
          <select
            value={values.unit}
            onChange={(event) =>
              updateField("unit", event.target.value as Unit)
            }
          >
            <option value="g">grams</option>
            <option value="ml">ml</option>
            <option value="piece">piece</option>
          </select>
        </label>
        <label>
          Base Quantity
          <input
            min="0.1"
            step="0.1"
            type="number"
            value={values.baseQuantity}
            onChange={(event) =>
              updateField("baseQuantity", Number(event.target.value))
            }
          />
        </label>
        <label>
          Carbs
          <input
            min="0"
            step="0.1"
            type="number"
            value={values.carbohydrates}
            onChange={(event) =>
              updateField("carbohydrates", Number(event.target.value))
            }
          />
        </label>
        <label>
          Protein
          <input
            min="0"
            step="0.1"
            type="number"
            value={values.proteins}
            onChange={(event) =>
              updateField("proteins", Number(event.target.value))
            }
          />
        </label>
        <label>
          Fat
          <input
            min="0"
            step="0.1"
            type="number"
            value={values.fats}
            onChange={(event) =>
              updateField("fats", Number(event.target.value))
            }
          />
        </label>
        <button type="submit">Add Food</button>
      </form>
    </section>
  );
}
