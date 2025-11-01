using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Spectre.Console;

namespace SimpleTetris
{
    public class GameEngine
    {
        private GameBoard board = new GameBoard(); // игровое поле
        private ITetromino current, next; // текущая и следующая фигуры
        private TetrominoFactory factory = new TetrominoFactory(); // все фигур
        private ScoreManager scoreManager = new ScoreManager(); // менеджер очков
        private SoundManager soundManager = new SoundManager(); // менеджер звуков
        private EnhancedRenderer renderer = new EnhancedRenderer(); // рендерер интерфейса
        // переменные для управления временем и состоянием игры
        private DateTime lastUpdate = DateTime.Now; // время последнего обновления
        private DateTime lastLevelCheck = DateTime.Now; // время последней проверки уровня
        private double updateInterval = 1000; // интервал обновления (мс)
        private bool isQuickDropPressed = false; // флаг быстрого падения
        private bool isQuickDropActive = false; // активно ли быстрое падение
        private bool isTurboMode = false; // режим турбо (ускоренная игра)
        private bool isPaused = false; // флаг паузы
        private int previousLevel = 1; // предыдущий уровень для отслеживания повышения

        public async Task StartGame()
        {
            // сброс всех состояний к начальным значениям
            board.Clear();
            scoreManager.Reset();
            updateInterval = 1000;
            isTurboMode = false;
            isQuickDropPressed = false;
            isQuickDropActive = false;
            isPaused = false;
            previousLevel = 1;
            lastLevelCheck = DateTime.Now;
            // создание первой фигуры
            SpawnNew();
            await GameLoop();
        }
        private async Task GameLoop()
        {
            while (true)
            {
                // обработка ввода с клавиатуры
                if (Console.KeyAvailable)
                {
                    var key = Console.ReadKey(true).Key;
                    // обработка игровых действий (только если не на паузе)
                    if (!isPaused)
                    {
                        switch (key)
                        {
                            case ConsoleKey.LeftArrow: 
                                if (Move(-1, 0)) soundManager.PlayMove();
                                break;
                            case ConsoleKey.RightArrow: 
                                if (Move(1, 0)) soundManager.PlayMove();
                                break;
                            case ConsoleKey.DownArrow: 
                                isQuickDropPressed = true;
                                isQuickDropActive = true;
                                soundManager.PlayDrop();
                                break;
                            case ConsoleKey.UpArrow: 
                                Rotate();
                                soundManager.PlayRotate();
                                break;
                            case ConsoleKey.Spacebar: 
                                soundManager.PlayDrop();
                                while (Move(0, 1)) { } // мгновенное падение до дна
                                break;
                            case ConsoleKey.T: 
                                ToggleTurboMode(); 
                                break;
                        }
                    }
                    // обработка системных команд (работают даже на паузе)
                    switch (key)
                    {
                        case ConsoleKey.P: TogglePause(); break;
                        case ConsoleKey.Q: return; // Выход из игры
                    }
                }
                else
                {
                    // сброс флага быстрого падения, если клавиша отпущена
                    if (isQuickDropPressed)
                    {
                        isQuickDropPressed = false;
                        isQuickDropActive = false;
                    }
                }
                // обновление игровой логики (только если не на паузе)
                if (!isPaused)
                {
                    // проверка повышения уровня каждую секунду
                    if ((DateTime.Now - lastLevelCheck).TotalSeconds >= 1)
                    {
                        scoreManager.UpdateLevelBasedOnTime();
                        lastLevelCheck = DateTime.Now;
                        // воспроизведение звука и анимации при повышении уровня
                        if (scoreManager.Level > previousLevel)
                        {
                            soundManager.PlayLevelUp();
                            renderer.RenderLevelUp(scoreManager.Level);
                            previousLevel = scoreManager.Level;
                            
                            // Обновление скорости с более плавным ускорением
                            updateInterval = CalculateSpeed(scoreManager.Level);
                        }
                    }
                    // расчет текущей скорости с учетом всех модификаторов
                    double currentSpeed = isTurboMode ? updateInterval * 0.3 : updateInterval;
                    currentSpeed = isQuickDropActive ? 50 : currentSpeed;
                    // автоматическое падение фигуры по таймеру
                    if ((DateTime.Now - lastUpdate).TotalMilliseconds >= currentSpeed)
                    {
                        if (!Move(0, 1)) // попытка сдвинуть фигуру вниз
                        {
                            // если движение невозможно - фиксируем фигуру
                            board.LockTetromino(current);
                            var cleared = board.ClearLines();
                            // обработка очищенных линий
                            if (cleared > 0)
                            {
                                scoreManager.AddLines(cleared);
                                renderer.RenderLineClear(cleared);
                                // специальный звук для тетриса (4 линии)
                                if (cleared == 4)
                                {
                                    soundManager.PlayTetris();
                                }
                                else
                                {
                                    soundManager.PlayLineClear();
                                }
                            }
                            // создание новой фигуры (игра заканчивается если нет места)
                            if (!SpawnNew()) break;
                        }
                        lastUpdate = DateTime.Now;
                    }
                }
                // отрисовка текущего состояния игры
                Render();
                await Task.Delay(16);
            }
            // код выполняется после завершения игры (проигрыша)
            soundManager.PlayGameOver();
            renderer.RenderGameOver(scoreManager.Score, scoreManager.Level, scoreManager.Lines);
            // СОХРАНЯЕМ РЕЗУЛЬТАТ ВСЕГДА, а не только если это рекорд
            var playerName = AnsiConsole.Ask<string>($"[green bold] Ваш счет: {scoreManager.Score}. Введите ваше имя:[/]");
            // Сохраняем результат
            scoreManager.SaveHighScore(playerName);
            // Проверяем, является ли это рекордом для специального сообщения
            if (scoreManager.IsHighScore())
            {
                AnsiConsole.Write(new Panel("[bold gold1] НОВЫЙ РЕКОРД! ВАШЕ ИМЯ В ИСТОРИИ! [/]")
                    .Border(BoxBorder.Double)
                    .BorderColor(Color.Yellow));
            }
            else
            {
                AnsiConsole.Write(new Panel("[bold green] Результат сохранен! [/]")
                    .Border(BoxBorder.Rounded)
                    .BorderColor(Color.Green));
            }
            AnsiConsole.MarkupLine("\n[grey]Нажмите любую клавишу для продолжения...[/]");
            Console.ReadKey();
        }
        /// <summary>
        /// расчет скорости падения фигур в зависимости от уровня
        /// </summary>
        /// <param name="level">Текущий уровень</param>
        /// <returns>Интервал обновления в миллисекундах</returns>
        private double CalculateSpeed(int level)
        {
            // плавное ускорение игры
            return level switch
            {
                1 => 1000, 
                2 => 950, 
                3 => 900,
                4 => 850,
                5 => 800,
                6 => 750, 
                7 => 700,
                8 => 650, 
                9 => 600, 
                10 => 550, 
                11 => 500, 
                12 => 450, 
                13 => 420,
                14 => 400,
                15 => 380,
                16 => 340,
                17 => 300, 
                18 => 280,
                19 => 260,
                20 => 240,
                _ => 200
            };
        }
        private bool SpawnNew()
        {
            // берем следующую фигуру или создаем новую если ее нет
            current = next ?? factory.CreateRandom();
            next = factory.CreateRandom();
            // устанавливаем начальную позицию
            current.Position = new Point(3, 0);
            current.ResetRotation();
            // проверяем столкновение - если есть, игра заканчивается
            return !board.CheckCollision(current);
        }
        /// <summary>
        /// перемещение текущей фигуры
        /// </summary>
        /// <param name="dx">Смещение по X</param>
        /// <param name="dy">Смещение по Y</param>
        /// <returns>True если перемещение успешно, False если невозможно</returns>
        private bool Move(int dx, int dy)
        {
            if (current == null) return false;
            // пробуем переместить фигуру
            current.Position = new Point(current.Position.X + dx, current.Position.Y + dy);
            // если есть столкновение - возвращаем на предыдущую позицию
            if (board.CheckCollision(current))
            {
                current.Position = new Point(current.Position.X - dx, current.Position.Y - dy);
                return false;
            }
            return true;
        }
        private void Rotate()
        {
            if (current == null) return;
            current.Rotate();
            // если после поворота есть столкновение - отменяем поворот
            if (board.CheckCollision(current))
                current.ResetRotation();
        }
        private void ToggleTurboMode()
        {
            isTurboMode = !isTurboMode;
        }
        private void TogglePause()
        {
            isPaused = !isPaused;
            if (isPaused)
            {
                soundManager.PlayDrop(); // звук при постановке на паузу
            }
        }
        private void Render()
        {
            AnsiConsole.Clear();
            // создаем layout с двумя колонками: игровое поле и информация
            var layout = new Layout("Root").SplitColumns(
                new Layout("Game").Size(60), // игровое поле (60% ширины)
                new Layout("Info") // панель информации (40% ширины)
            );
            // отрисовываем игровое поле с текущей фигурой
            var gameContent = board.Render(current);
            var gamePanel = new Panel(gameContent)
                .Header($"[bold green] TETRIS {(isTurboMode ? "" : "")}[/]")
                .BorderColor(isTurboMode ? Color.Red : Color.Green)
                .Border(isTurboMode ? BoxBorder.Double : BoxBorder.Rounded);
            // добавляем надпись "PAUSED" если игра на паузе
            if (isPaused)
            {
                gameContent += "\n\n" + new FigletText("PAUSED").Centered().Color(Color.Yellow).ToString();
            }
            
            layout["Game"].Update(gamePanel);
            // подготавливаем информацию для правой панели
            var timeToNextLevel = 10 - (int)(DateTime.Now - scoreManager.GameStartTime).TotalSeconds % 10;
            var speedInfo = isTurboMode ? "[red bold] ТУРБО РЕЖИМ[/]" : "[green] Нормальная скорость[/]";
            var dropInfo = isQuickDropActive ? "[yellow] Быстрое падение[/]" : "[grey] Обычное падение[/]";
            var pauseInfo = isPaused ? "[red]⏸ ПАУЗА[/]" : "[green] Играем[/]";
            
            // Добавляем информацию о текущей скорости
            var currentSpeedMs = isTurboMode ? updateInterval * 0.3 : updateInterval;
            var speedDisplay = $"{(int)currentSpeedMs} мс";
            
            // формируем строки информации
            var infoLines = new List<string>
            {
                $"[bold] Счёт:[/] [aqua]{scoreManager.Score:N0}[/]",
                $"[bold] Уровень:[/] [green]{scoreManager.Level}[/]",
                $"[bold] Линии:[/] [blue]{scoreManager.Lines}[/]",
                $"[bold] Скорость:[/] [yellow]{speedDisplay}[/]",
                $"[bold] След. уровень:[/] [yellow]{timeToNextLevel}с[/]",
                "",
                $"[bold] СТАТУС:[/]",
                $"   {speedInfo}",
                $"   {dropInfo}",
                $"   {pauseInfo}",
                "",
                "[bold] Следующая:[/]",
                next?.Render() ?? "", // отрисовываем следующую фигуру
                "",
                " [bold] УПРАВЛЕНИЕ:[/]",
                "<-->  [grey]Движение[/]",
                "стрелка вверх  [grey]Поворот[/]",
                "стрелка вниз  [grey]Быстрое падение[/]",
                "Пробел  [grey]Мгновенное падение[/]",
                "T  [grey]Турбо режим[/]",
                "P  [grey]Пауза[/]",
                "Q  [grey]Выход[/]"
            };
            // создаем панель информации
            var infoPanel = new Panel(string.Join("\n", infoLines))
                .Border(BoxBorder.Rounded)
                .BorderColor(Color.Blue)
                .Header("[bold blue] ИНФОРМАЦИЯ[/]");
            
            layout["Info"].Update(infoPanel);
            AnsiConsole.Write(layout);
        }
    }
}
