using System;
using System.Text;

namespace SimpleTetris
{
    public class GameBoard : IGameBoard
    {
        // константы для размеров игрового поля
        public const int WIDTH = 10; // ширина поля в блоках
        public const int HEIGHT = 20; // высота поля в блоках
        
        // двумерные массивы для хранения состояния поля
        private int[,] grid = new int[HEIGHT, WIDTH];
        private ConsoleColor[,] colors = new ConsoleColor[HEIGHT, WIDTH]; // цвета блоков

        public void Clear()
        {
            for (int y = 0; y < HEIGHT; y++)
            {
                for (int x = 0; x < WIDTH; x++)
                {
                    grid[y, x] = 0; // очищаем 
                    colors[y, x] = ConsoleColor.Gray; // устанавливаем серый цвет
                }
            }
        }
        /// <summary>
        /// проверка столкновения фигуры с границами или другими фигурами
        /// </summary>
        /// <param name="tetromino">Проверяемая фигура</param>
        /// <returns>True если есть столкновение, иначе False</returns>
        public bool CheckCollision(ITetromino tetromino)
        {
            var shape = tetromino.Shape;
            
            // проходим по всем ячейкам фигуры
            for (int y = 0; y < shape.GetLength(0); y++)
            {
                for (int x = 0; x < shape.GetLength(1); x++)
                {
                    if (shape[y, x] == 0) continue; // пропускаем пустые ячейки фигуры

                    // вычисляем позицию на игровом поле
                    int boardX = tetromino.Position.X + x;
                    int boardY = tetromino.Position.Y + y;

                    // проверка выхода за границы по горизонтали или снизу
                    if (boardX < 0 || boardX >= WIDTH || boardY >= HEIGHT)
                        return true;

                    // проверка столкновения с другими фигурами
                    if (boardY >= 0 && grid[boardY, boardX] != 0)
                        return true;
                }
            }
            return false; // столкновений нет
        }
        /// <summary>
        /// фиксация фигуры на игровом поле после достижения дна
        /// </summary>
        /// <param name="tetromino">Фигура для фиксации</param>
        public void LockTetromino(ITetromino tetromino)
        {
            var shape = tetromino.Shape;
            
            for (int y = 0; y < shape.GetLength(0); y++)
            {
                for (int x = 0; x < shape.GetLength(1); x++)
                {
                    if (shape[y, x] == 0) continue; // пропускаем пустые ячейки

                    int boardX = tetromino.Position.X + x;
                    int boardY = tetromino.Position.Y + y;

                    // фиксируем только те ячейки, которые находятся на поле
                    if (boardY >= 0)
                    {
                        grid[boardY, boardX] = 1; // помечаем как заполненную
                        colors[boardY, boardX] = tetromino.Color; // сохраняем цвет фигуры
                    }
                }
            }
        }
        public int ClearLines()
        {
            int linesCleared = 0;
            
            // проверяем линии снизу вверх
            for (int y = HEIGHT - 1; y >= 0; y--)
            {
                bool complete = true;
                
                // проверяем, заполнена ли вся линия
                for (int x = 0; x < WIDTH; x++)
                {
                    if (grid[y, x] == 0) { complete = false; break; }
                }
                // если линия полностью заполнена
                if (complete)
                {
                    linesCleared++;
                    
                    // сдвигаем все линии выше текущей вниз
                    for (int yy = y; yy > 0; yy--)
                    {
                        for (int x = 0; x < WIDTH; x++)
                        {
                            grid[yy, x] = grid[yy - 1, x]; // переносим состояние
                            colors[yy, x] = colors[yy - 1, x]; // переносим цвет
                        }
                    }
                    // очищаем самую верхнюю линию
                    for (int x = 0; x < WIDTH; x++)
                    {
                        grid[0, x] = 0;
                        colors[0, x] = ConsoleColor.Gray;
                    }
                    // повторно проверяем текущую позицию (т.к. линии сдвинулись)
                    y++;
                }
            }
            return linesCleared;
        }
        public ConsoleColor[,] GetColors()
        {
            return colors;
        }
        /// <summary>
        /// отрисовка игрового поля с текущей фигурой
        /// </summary>
        /// <param name="current">Текущая активная фигура (опционально)</param>
        /// <returns>Строковое представление игрового поля</returns>
        public string Render(ITetromino current = null)
        {
            // буферы для отрисовки (каждый блок занимает 2 символа по ширине)
            var buffer = new char[HEIGHT, WIDTH * 2];
            var colorBuffer = new ConsoleColor[HEIGHT, WIDTH * 2];
            // копируем состояние игрового поля в буфер
            for (int y = 0; y < HEIGHT; y++)
            {
                for (int x = 0; x < WIDTH; x++)
                {
                    // заполняем блоки символами (█ для заполненных, пробел для пустых)
                    buffer[y, x * 2] = buffer[y, x * 2 + 1] = grid[y, x] == 1 ? '█' : ' ';
                    colorBuffer[y, x * 2] = colorBuffer[y, x * 2 + 1] = colors[y, x];
                }
            }
            // отрисовываем текущую фигуру поверх поля
            if (current != null)
            {
                var shape = current.Shape;
                for (int y = 0; y < shape.GetLength(0); y++)
                {
                    for (int x = 0; x < shape.GetLength(1); x++)
                    {
                        if (shape[y, x] == 0) continue; // пропускаем пустые ячейки фигуры
                        int boardX = current.Position.X + x;
                        int boardY = current.Position.Y + y;
                        // отрисовываем только те части фигуры, которые находятся в пределах поля
                        if (boardY >= 0 && boardY < HEIGHT && boardX >= 0 && boardX < WIDTH)
                        {
                            buffer[boardY, boardX * 2] = buffer[boardY, boardX * 2 + 1] = '█';
                            colorBuffer[boardY, boardX * 2] = colorBuffer[boardY, boardX * 2 + 1] = current.Color;
                        }
                    }
                }
            }
            // строим рамку и содержимое поля
            var sb = new StringBuilder();
            sb.Append('┌').Append(new string('─', WIDTH * 2)).AppendLine("┐");
            // отрисовываем каждую строку поля
            for (int y = 0; y < HEIGHT; y++)
            {
                sb.Append('│');
                for (int x = 0; x < WIDTH * 2; x++)
                {
                    var color = colorBuffer[y, x];
                    // добавляем цветовую разметку для Spectre.Console
                    if (color != ConsoleColor.Gray)
                    {
                        sb.Append($"[{GetColorCode(color)}]");
                    }
                    sb.Append(buffer[y, x]);
                    if (color != ConsoleColor.Gray)
                    {
                        sb.Append("[/]");
                    }
                }
                sb.AppendLine("│");
            }
            sb.Append('└').Append(new string('─', WIDTH * 2)).Append("┘");
            return sb.ToString();
        }
        private string GetColorCode(ConsoleColor color)
        {
            return color switch
            {
                ConsoleColor.Red => "red",
                ConsoleColor.Green => "green",
                ConsoleColor.Blue => "blue",
                ConsoleColor.Yellow => "yellow",
                ConsoleColor.Magenta => "purple", // Magenta отображается как purple в Spectre.Console
                _ => "white" // цвет по умолчанию
            };
        }
    }
}
