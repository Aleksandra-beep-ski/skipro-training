using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace SimpleTetris
{
    public class HighScoreManager : IHighScoreManager
    {
        // имя файла для хранения рекордов
        private readonly string HighScoresFile = "highscores.json";
        public List<HighScore> LoadHighScores()
        {
            try
            {
                // проверяем существует ли файл с рекордами
                if (File.Exists(HighScoresFile))
                {
                    // ситаем весь текст из файла
                    var json = File.ReadAllText(HighScoresFile);
                    // десериализуем JSON в список объектов HighScore
                    return JsonSerializer.Deserialize<List<HighScore>>(json) ?? new List<HighScore>();
                }
            }
            catch (Exception)
            {
                // в случае ошибки (поврежденный файл) возвращаем пустой список
                // исключение поглощается для обеспечения стабильной работы игры
            }
            // возвращаем пустой список если файла нет или произошла ошибка
            return new List<HighScore>();
        }
        /// <summary>
        /// сохранение нового рекорда в файл
        /// </summary>
        /// <param name="newScore">Новый рекорд для сохранения</param>
        public void SaveHighScore(HighScore newScore)
        {
            // загружаем текущие рекорды
            var highScores = LoadHighScores();
            // добавляем новый рекорд
            highScores.Add(newScore);
            // сортируем рекорды по убыванию счета
            highScores.Sort((a, b) => b.Score.CompareTo(a.Score));
            // ограничиваем таблицу 5 лучшими результатами (было 10)
            if (highScores.Count > 5)
            {
                highScores = highScores.GetRange(0, 5);
            }
            try
            {
                // настройки сериализации для форматирования JSON
                var options = new JsonSerializerOptions { WriteIndented = true };
                // Сериализуем список рекордов в JSON строку
                var json = JsonSerializer.Serialize(highScores, options);
                // Записываем JSON в файл
                File.WriteAllText(HighScoresFile, json);
            }
            catch (Exception)
            {
            }
        }
    }
}
