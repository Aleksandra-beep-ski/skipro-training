using System;
using System.Collections.Generic;

namespace SimpleTetris
{
    public interface ITetromino
    {
        // текущая позиция фигуры на игровом поле
        Point Position { get; set; }
        // матрица, определяющая форму фигуры (0 - пусто, 1 - заполнено)
        int[,] Shape { get; }
        // цвет фигуры для отрисовки
        ConsoleColor Color { get; }
        // поворот фигуры на 90 градусов
        void Rotate();
        // сброс поворота в исходное состояние
        void ResetRotation();
        // визуальное представление фигуры в виде строки
        string Render();
    }
    public interface IGameBoard
    {
        // очистка игрового поля
        void Clear();
        // проверка столкновения фигуры с границами или другими фигурами
        bool CheckCollision(ITetromino tetromino);
        // фиксация фигуры на игровом поле после достижения дна
        void LockTetromino(ITetromino tetromino);
        // очистка заполненных линий и возврат количества очищенных линий
        int ClearLines();
        // отрисовка игрового поля с текущей фигурой
        string Render(ITetromino currentTetromino = null);
        // получение матрицы цветов для отрисовки
        ConsoleColor[,] GetColors();
    }
    public interface IScoreManager
    {
        // текущее количество очков
        int Score { get; }
        // количество очищенных линий
        int Lines { get; }
        // текущий уровень игры
        int Level { get; }
        // время начала игры
        DateTime GameStartTime { get; }
        // сброс всех показателей
        void Reset();
        // добавление очищенных линий и подсчет очков
        void AddLines(int linesCount);
        // проверка, является ли текущий счет рекордом
        bool IsHighScore();
        // сохранение рекорда с именем игрока
        void SaveHighScore(string playerName);
        // обновление уровня на основе времени игры
        void UpdateLevelBasedOnTime();
    }
    public interface IHighScoreManager
    {
        // загрузка списка рекордов из файла
        List<HighScore> LoadHighScores();
        // сохранение нового рекорда в файл
        void SaveHighScore(HighScore newScore);
    }

    public interface ISoundManager
    {
        // звук движения фигуры
        void PlayMove();
        // звук поворота фигуры
        void PlayRotate();
        // звук быстрого падения
        void PlayDrop();
        // звук очистки линии
        void PlayLineClear();
        // звук повышения уровня
        void PlayLevelUp();
        // звук окончания игры
        void PlayGameOver();
        // специальный звук для тетриса (4 линии)
        void PlayTetris();
    }
}
public struct Point
{
    public int X, Y;
    
    // конструктор для создания точки с заданными координатами
    public Point(int x, int y) { X = x; Y = y; }
}
