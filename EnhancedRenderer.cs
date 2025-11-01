using System;
using System.Threading.Tasks;
using Spectre.Console;

namespace SimpleTetris
{
    public class EnhancedRenderer
    {
        public void RenderMainMenu()
        {
            AnsiConsole.Clear(); // очищаем консоль перед отрисовкой
            // создаем красивый ASCII-заголовок "TETRIS"
            var figlet = new FigletText(FigletFont.Default, "TETRIS")
                .Centered() // выравнивание по центру
                .Color(Color.Green); // зеленый цвет
            AnsiConsole.Write(figlet);
            // создаем стилизованную панель с информацией
            var panel = new Panel(" [bold yellow]CLASSIC TETRIS[/] ")
                .Border(BoxBorder.Double) // двойная рамка
                .BorderColor(Color.Yellow); // желтая рамка
                
            AnsiConsole.Write(panel);
        }
        /// <summary>
        /// отрисовка экрана окончания игры с результатами
        /// </summary>
        /// <param name="score">Финальный счет</param>
        /// <param name="level">Достигнутый уровень</param>
        /// <param name="lines">Количество очищенных линий</param>
        public void RenderGameOver(int score, int level, int lines)
        {
            AnsiConsole.Clear();
            // большой текст "GAME OVER"
            var figlet = new FigletText(FigletFont.Default, "GAME OVER")
                .Centered()
                .Color(Color.Red);
            AnsiConsole.Write(figlet);
            // таблица с результатами игры
            var table = new Table()
                .Border(TableBorder.Rounded) 
                .BorderColor(Color.Yellow)
                .Title("[bold]РЕЗУЛЬТАТЫ ИГРЫ[/]");
            // добавляем колонки для параметров и значений
            table.AddColumn(new TableColumn("[yellow]Параметр[/]").Centered());
            table.AddColumn(new TableColumn("[green]Значение[/]").Centered());
            // заполняем таблицу данными
            table.AddRow("[bold]Счёт[/]", $"[bold aqua]{score}[/]");
            table.AddRow("[bold]Уровень[/]", $"[bold green]{level}[/]");
            table.AddRow("[bold]Линии[/]", $"[bold blue]{lines}[/]");
            
            AnsiConsole.Write(table);
        }
        /// <summary>
        /// анимация повышения уровня с цветовой индикацией сложности
        /// </summary>
        /// <param name="newLevel">Новый уровень</param>
        public void RenderLevelUp(int newLevel)
        {
            // определяем цвет в зависимости от уровня сложности
            var color = newLevel switch
            {
                <= 3 => Color.Green,
                <= 6 => Color.Yellow,
                <= 9 => Color.Orange1,
                _ => Color.Red
            };
            // создаем уведомление о повышении уровня
            var panel = new Panel($"[bold {color}] УРОВЕНЬ {newLevel}! [/]")
                .Border(BoxBorder.Double)  // двойная рамка для акцента
                .BorderColor(color) // цвет рамки соответствует уровню
                .Padding(1, 1); // отступы вокруг текста
            AnsiConsole.Write(panel);
            Task.Delay(1000).Wait(); // задержка для видимости уведомления
        }
        /// <summary>
        /// визуальное уведомление об очистке линий с разными сообщениями для разного количества
        /// </summary>
        /// <param name="linesCount">Количество очищенных линий за один ход</param>
        public void RenderLineClear(int linesCount)
        {
            // разные сообщения в зависимости от количества очищенных линий
            var message = linesCount switch
            {
                1 => "[green] Линия![/]", 
                2 => "[yellow] Двойная![/]",
                3 => "[orange1] Тройная![/]", 
                4 => "[red bold] TETRIS! [/]",
                _ => ""
            };
            // создаем уведомление только если есть сообщение
            if (!string.IsNullOrEmpty(message))
            {
                var panel = new Panel(message)
                    .Border(BoxBorder.Rounded)
                    // красная рамка для тетриса, желтая для остальных
                    .BorderColor(linesCount == 4 ? Color.Red : Color.Yellow);
                    
                AnsiConsole.Write(panel);
            }
        }
    }
}