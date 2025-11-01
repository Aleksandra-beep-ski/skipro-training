using System;
using System.Collections.Generic;

namespace SimpleTetris
{
    public class Tetromino : ITetromino
    {
        // текущая позиция фигуры на игровом поле
        public Point Position { get; set; }
        // текущая форма фигуры (матрица 0 и 1)
        public int[,] Shape { get; private set; }
        // цвет фигуры для отрисовки
        public ConsoleColor Color { get; private set; }
        // текущий индекс поворота (4 возможных ориентаций)
        private int currentRotation;
        // массив всех возможных поворотов фигуры
        private int[][,] rotations;
        /// <summary>
        /// конструктор тетромино
        /// </summary>
        /// <param name="rotations">Массив всех возможных поворотов фигуры</param>
        /// <param name="color">Цвет фигуры</param>
        /// <param name="startX">Начальная позиция X</param>
        /// <param name="startY">Начальная позиция Y</param>
        public Tetromino(int[][,] rotations, ConsoleColor color, int startX = 0, int startY = 0)
        {
            this.rotations = rotations;
            this.Color = color;
            Shape = rotations[0]; // начинаем с первой ориентации
            Position = new Point(startX, startY);
            currentRotation = 0;
        }
        public void Rotate()
        {
            // циклически перебираем все возможные повороты
            currentRotation = (currentRotation + 1) % rotations.Length;
            Shape = rotations[currentRotation];
        }
        public void ResetRotation()
        {
            currentRotation = 0;
            Shape = rotations[0];
        }
        public string Render()
        {
            var result = "";
            // проходим по всем строкам матрицы фигуры
            for (int y = 0; y < Shape.GetLength(0); y++)
            {
                // проходим по всем столбцам матрицы фигуры
                for (int x = 0; x < Shape.GetLength(1); x++)
                {
                    // "██" для заполненных блоков, "  " для пустых
                    result += Shape[y, x] == 1 ? "██" : "  ";
                }
                result += "\n"; // переход на новую строку после каждой строки матрицы
            }
            return result;
        }
    }
    public class TetrominoFactory
    {
        // генератор случайных чисел для выбора случайной фигуры
        private Random random = new Random();
        public ITetromino CreateRandom()
        {
            // список всех возможных типов фигур с их поворотами и цветами
            var types = new List<(int[][,] rotations, ConsoleColor color)>
            {
                // I-фигура (длинная палка) - синий цвет
                (
                    new int[][,] {
                        new int[,] { {0,0,0,0}, {1,1,1,1}, {0,0,0,0}, {0,0,0,0} }, // горизонтальное положение
                        new int[,] { {0,0,1,0}, {0,0,1,0}, {0,0,1,0}, {0,0,1,0} }, // вертикальное положение
                        new int[,] { {0,0,0,0}, {0,0,0,0}, {1,1,1,1}, {0,0,0,0} }, // сдвинутая горизонтальная
                        new int[,] { {0,1,0,0}, {0,1,0,0}, {0,1,0,0}, {0,1,0,0} }  // сдвинутая вертикальная
                    },
                    ConsoleColor.Blue
                ),
                // O-фигура (квадрат) - желтый цвет
                (
                    new int[][,] {
                        new int[,] { {1,1}, {1,1} } // квадрат не имеет поворотов
                    },
                    ConsoleColor.Yellow
                ),
                // L-фигура - зеленый цвет
                (
                    new int[][,] {
                        new int[,] { {1,0,0}, {1,1,1}, {0,0,0} }, // базовое положение
                        new int[,] { {0,1,1}, {0,1,0}, {0,1,0} }, // поворот 90°
                        new int[,] { {0,0,0}, {1,1,1}, {0,0,1} }, // поворот 180°
                        new int[,] { {0,1,0}, {0,1,0}, {1,1,0} }  // поворот 270°
                    },
                    ConsoleColor.Green
                ),
                // J-фигура (зеркальная L) - красный цвет
                (
                    new int[][,] {
                        new int[,] { {0,0,1}, {1,1,1}, {0,0,0} },
                        new int[,] { {0,1,0}, {0,1,0}, {0,1,1} },
                        new int[,] { {0,0,0}, {1,1,1}, {1,0,0} },
                        new int[,] { {1,1,0}, {0,1,0}, {0,1,0} }
                    },
                    ConsoleColor.Red
                ),
                // T-фигура - розовый цвет (Magenta)
                (
                    new int[][,] {
                        new int[,] { {0,1,0}, {1,1,1}, {0,0,0} },
                        new int[,] { {0,1,0}, {0,1,1}, {0,1,0} },
                        new int[,] { {0,0,0}, {1,1,1}, {0,1,0} },
                        new int[,] { {0,1,0}, {1,1,0}, {0,1,0} }
                    },
                    ConsoleColor.Magenta
                ),
                // S-фигура - синий цвет
                (
                    new int[][,] {
                        new int[,] { {0,1,1}, {1,1,0}, {0,0,0} },
                        new int[,] { {0,1,0}, {0,1,1}, {0,0,1} },
                        new int[,] { {0,0,0}, {0,1,1}, {1,1,0} },
                        new int[,] { {1,0,0}, {1,1,0}, {0,1,0} }
                    },
                    ConsoleColor.Blue
                ),
                // Z-фигура (зеркальная S) - зеленый цвет
                (
                    new int[][,] {
                        new int[,] { {1,1,0}, {0,1,1}, {0,0,0} },
                        new int[,] { {0,0,1}, {0,1,1}, {0,1,0} },
                        new int[,] { {0,0,0}, {1,1,0}, {0,1,1} },
                        new int[,] { {0,1,0}, {1,1,0}, {1,0,0} }
                    },
                    ConsoleColor.Green
                )
            };

            // выбираем случайный тип фигуры из списка
            var type = types[random.Next(types.Count)];
            // создаем и возвращаем новый тетромино выбранного типа
            return new Tetromino(type.rotations, type.color);
        }
    }
}
