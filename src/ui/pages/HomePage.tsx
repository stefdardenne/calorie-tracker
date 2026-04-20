import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import type { CompositionRoot } from "../../application/composition";
import { calculateLoggedNutrition } from "../../domain/rules/nutrition/nutrition";

interface HomePageProps {
  composition: CompositionRoot;
}

interface DailyCalories {
  dateKey: string;
  dateLabel: string;
  calories: number;
}

const WEEK_LENGTH_DAYS = 7;

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getLastNDaysInclusive(baseDate: Date, count: number): Date[] {
  const dates: Date[] = [];
  const baseDay = startOfLocalDay(baseDate);

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const day = new Date(baseDay);
    day.setDate(baseDay.getDate() - offset);
    dates.push(day);
  }

  return dates;
}

export function HomePage({ composition }: HomePageProps) {
  const [dailyCalories, setDailyCalories] = useState<DailyCalories[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let isActive = true;

    async function loadWeeklySummary(): Promise<void> {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const foods = await composition.listFoodItems();
        const foodsById = new Map(foods.map((food) => [food.id, food]));
        const targetDays = getLastNDaysInclusive(new Date(), WEEK_LENGTH_DAYS);

        const nextDailyCalories = await Promise.all(
          targetDays.map(async (day): Promise<DailyCalories> => {
            const entries = await composition.listLogEntriesForDay(day);
            const calories = entries.reduce((total, entry) => {
              const food = foodsById.get(entry.foodItemId);
              if (!food) {
                return total;
              }

              try {
                return total + calculateLoggedNutrition(food, entry).calories;
              } catch {
                return total;
              }
            }, 0);

            return {
              dateKey: toDateKey(day),
              dateLabel: toDateLabel(day),
              calories: Math.round(calories),
            };
          }),
        );

        if (!isActive) {
          return;
        }

        setDailyCalories(nextDailyCalories);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(String(error));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadWeeklySummary();

    return () => {
      isActive = false;
    };
  }, [composition]);

  const todayDateKey = toDateKey(new Date());

  const todayCalories = useMemo(() => {
    return dailyCalories.find((day) => day.dateKey === todayDateKey)?.calories ?? 0;
  }, [dailyCalories, todayDateKey]);

  const weekCalories = useMemo(() => {
    return dailyCalories.reduce((total, day) => total + day.calories, 0);
  }, [dailyCalories]);

  return (
    <section className="page-section">
      <h2>Welcome</h2>
      <p>Track foods and manage your calorie data while learning React.</p>
      <p>
        Start on the <Link to="/foods">foods page</Link>.
      </p>

      <section className="panel" aria-live="polite">
        <h3>Weekly Summary</h3>
        <div className="summary-metrics">
          <p className="summary-metric">
            <span className="summary-metric__label">Today</span>
            <strong>{todayCalories} kcal</strong>
          </p>
          <p className="summary-metric">
            <span className="summary-metric__label">This week</span>
            <strong>{weekCalories} kcal</strong>
          </p>
        </div>

        {isLoading ? <p>Loading summary...</p> : null}
        {errorMessage ? <p className="status status--error">{errorMessage}</p> : null}

        {!isLoading && !errorMessage ? (
          <table className="foods-table" aria-label="Daily calories for the last 7 days">
            <thead>
              <tr>
                <th>Date</th>
                <th>Kcal</th>
              </tr>
            </thead>
            <tbody>
              {dailyCalories.map((day) => (
                <tr key={day.dateKey}>
                  <td>{day.dateLabel}</td>
                  <td>{day.calories}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </section>
  );
}
