using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Spectre.Console;
namespace SimpleTetris
{
    class Program
    {
        static async Task Main(string[] args)
        {
            // устанавливаем кодировку для поддержки Unicode символов
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            // создаем и запускаем главную игру
            var game = new TetrisGame();
            await game.Run();
        }
    }
    public class TetrisGame
    {
        // рендерер для красивого отображения интерфейса
        private EnhancedRenderer renderer = new EnhancedRenderer();
        public async Task Run()
        {
            while (true)
            {
                // отрисовываем главное меню
                renderer.RenderMainMenu();
                // создаем интерактивное меню выбора
                var choice = AnsiConsole.Prompt(new SelectionPrompt<string>()
                    .Title("[yellow] ГЛАВНОЕ МЕНЮ:[/]")
                    .PageSize(10)
                    .HighlightStyle(Style.Parse("green bold"))
                    .AddChoices(
                        "Новая игра", 
                        "Рекорды", 
                        "Помощь",
                        "Выход"
                    ));
                // обрабатываем выбор пользователя
                switch (choice)
                {
                    case "Новая игра":
                        var engine = new GameEngine();
                        await engine.StartGame();
                        break;
                    case "Рекорды":
                        ShowHighScores();
                        break;
                    case "Помощь":
                        ShowHelp();
                        break;
                    case "Выход":
                        AnsiConsole.MarkupLine("[red] До свидания![/]");
                        return;
                }
            }
        }
        private void ShowHighScores()
        {
            var highScoreManager = new HighScoreManager();
            var highScores = highScoreManager.LoadHighScores();
            // проверяем есть ли рекорды
            if (!highScores.Any())
            {
                AnsiConsole.MarkupLine("[yellow]Рекордов пока нет! Будьте первым![/]");
                AnsiConsole.WriteLine("Нажмите любую клавишу для продолжения...");
                Console.ReadKey();
                return;
            }
            // создаем таблицу рекордов
            var table = new Table()
                .Border(TableBorder.Double)
                .BorderColor(Color.Yellow)
                .Title("[bold yellow]ТАБЛИЦА РЕКОРДОВ[/]");
            // добавляем колонки таблицы
            table.AddColumn(new TableColumn("[bold]#[/]").Centered());
            table.AddColumn(new TableColumn("[bold]Игрок[/]").Centered());
            table.AddColumn(new TableColumn("[bold]Счёт[/]").Centered());
            table.AddColumn(new TableColumn("[bold]Уровень[/]").Centered());
            table.AddColumn(new TableColumn("[bold]Линии[/]").Centered());
            table.AddColumn(new TableColumn("[bold]Дата[/]").Centered());
            // заполняем таблицу данными
            for (int i = 0; i < highScores.Count; i++)
            {
                var score = highScores[i];
                // определяем цвет в зависимости от места в рейтинге
                var rankColor = i switch
                {
                    0 => "gold1", // золото для первого места
                    1 => "silver", // серебро для второго
                    2 => "orange1", // бронза для третьего
                    _ => "white" // белый для остальных
                };
                // определяем символ для места
                var rankSymbol = i switch
                {
                    0 => "1",
                    1 => "2",
                    2 => "3",
                    _ => $"{i + 1}"
                };
                // добавляем строку в таблицу
                table.AddRow(
                    $"[{rankColor}]{rankSymbol}[/]",
                    $"[{rankColor}]{score.PlayerName}[/]",
                    $"[{rankColor}]{score.Score:N0}[/]",
                    $"[{rankColor}]{score.Level}[/]",
                    $"[{rankColor}]{score.Lines}[/]",
                    $"[{rankColor}]{score.Date:dd.MM.yy HH:mm}[/]"
                );
            }
            // отображаем таблицу
            AnsiConsole.Write(table);
            AnsiConsole.MarkupLine("\n[grey]Нажмите любую клавишу для продолжения...[/]");
            Console.ReadKey();
        }
        private void ShowHelp()
        {
            var panel = new Panel(@"
[bold green]ПРАВИЛА TETRIS:[/]

• Собирайте горизонтальные линии из фигур
• Каждая линия приносит очки
• 4 линии одновременно = [red]TETRIS![/] 
• Уровень повышается каждые 10 секунд
• Игра ускоряется с каждым уровнем

[bold yellow] СОВЕТЫ:[/]
• Старайтесь делать TETRIS (4 линии)
• Используйте турбо-режим (T) для тренировки
• Смотрите следующую фигуру для планирования
• Не оставляйте пустых пространств

[red]Автор - Жаркова Александра, группа О745Б[/]

[grey]Удачи в игре! [/]")
                .Border(BoxBorder.Double)
                .BorderColor(Color.Blue)
                .Header("[bold blue] ПОМОЩЬ И СОВЕТЫ[/]");

            AnsiConsole.Write(panel);
            AnsiConsole.MarkupLine("\n[grey]Нажмите любую клавишу для продолжения...[/]");
            Console.ReadKey();
        }
    }
}