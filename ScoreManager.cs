using System;

namespace SimpleTetris
{
    public class ScoreManager : IScoreManager
    {
        // текущее количество очков
        public int Score { get; private set; }
        // общее количество очищенных линий
        public int Lines { get; private set; }
        // текущий уровень игры (влияет на скорость)
        public int Level { get; private set; }
        // время начала текущей игровой сессии
        public DateTime GameStartTime { get; private set; }
        public void Reset()
        {
            Score = 0;
            Lines = 0;
            Level = 1;
            GameStartTime = DateTime.Now;
        }
        /// <summary>
        /// добавление очищенных линий и подсчет очков
        /// </summary>
        /// <param name="linesCount">Количество очищенных линий за один ход</param>
        public void AddLines(int linesCount)
        {
            Lines += linesCount;
            // подсчет очков в зависимости от количества очищенных линий
            int points = linesCount switch
            {
                1 => 100 * Level, // 1 линия: 100 очков × уровень
                2 => 300 * Level, // 2 линии: 300 очков × уровень (бонус за сложность)
                3 => 500 * Level, // 3 линии: 500 очков × уровень
                4 => 800 * Level, // 4 линии (ТЕТРИС): 800 очков × уровень
                _ => 0 // другие случаи их как бы нет
            };
            Score += points;
        }
        public void UpdateLevelBasedOnTime()
        {
            var elapsed = DateTime.Now - GameStartTime;
            // уровень = (секунды / 10) + 1, но не менее 1
            Level = Math.Max(1, (int)elapsed.TotalSeconds / 10 + 1);
        }
        public bool IsHighScore()
        {
            var highScoreManager = new HighScoreManager();
            var highScores = highScoreManager.LoadHighScores();
            // рекорд если таблица пуста или текущий счет больше лучшего рекорда
            return highScores.Count == 0 || Score > highScores[0].Score;
        }
        /// <summary>
        /// сохранение нового рекорда с именем игрока
        /// </summary>
        /// <param name="playerName">Имя игрока установившего рекорд</param>
        public void SaveHighScore(string playerName)
        {
            var highScoreManager = new HighScoreManager();
            // создаем новую запись рекорда и сохраняем
            highScoreManager.SaveHighScore(new HighScore(playerName, Score, Level, Lines));
        }
    }
}
