using System;

namespace SimpleTetris
{
    public class HighScore
    {
        public string PlayerName { get; set; } = string.Empty;
        public int Score { get; set; }
        public int Level { get; set; }
        public int Lines { get; set; }
        public DateTime Date { get; set; }
        public HighScore() { }
        /// <summary>
        /// конструктор для создания нового рекорда
        /// </summary>
        /// <param name="playerName">Имя игрока</param>
        /// <param name="score">Количество очков</param>
        /// <param name="level">Достигнутый уровень</param>
        /// <param name="lines">Количество линий</param>
        public HighScore(string playerName, int score, int level, int lines)
        {
            PlayerName = playerName;
            Score = score;
            Level = level;
            Lines = lines;
            Date = DateTime.Now;
        }
    }
}
