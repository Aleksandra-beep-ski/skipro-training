using System;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace SimpleTetris
{
    public class SoundManager : ISoundManager
    {
        [DllImport("kernel32.dll")]
        private static extern bool Beep(int frequency, int duration);
        
        private bool IsWindows => RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
        private bool IsMacOS => RuntimeInformation.IsOSPlatform(OSPlatform.OSX);
        private bool IsLinux => RuntimeInformation.IsOSPlatform(OSPlatform.Linux);
        
        private const int MIN_SOUND_DELAY = 30;
        private DateTime lastSoundTime = DateTime.Now;

        public void PlayMove() => PlayQuickSound(500, 30);
        public void PlayRotate() => PlayQuickSound(600, 40);
        public void PlayDrop() => PlayQuickSound(300, 50);
        public void PlayLineClear() => PlayQuickSound(800, 100);
        public void PlayLevelUp() => PlayQuickSound(1000, 200);
        public void PlayGameOver() => PlayQuickSound(200, 500);
        public void PlayTetris() => PlayQuickSound(1200, 300);

        private void PlayQuickSound(int frequency, int duration)
        {
            var now = DateTime.Now;
            if ((now - lastSoundTime).TotalMilliseconds < MIN_SOUND_DELAY)
                return;
                
            lastSoundTime = now;

            try
            {
                if (IsWindows)
                {
                    Beep(frequency, duration);
                }
                else if (IsMacOS)
                {
                    PlayMacSound(frequency, duration);
                }
                else if (IsLinux)
                {
                    PlayLinuxSound(frequency, duration);
                }
                else
                {
                    Console.Write("\a");
                }
            }
            catch
            {
                try
                {
                    Console.Write("\a");
                }
                catch
                {
                }
            }
        }

        private void PlayMacSound(int frequency, int duration)
        {
            try
            {
                string tempFile = System.IO.Path.GetTempPath() + Guid.NewGuid().ToString() + ".wav";
                CreateToneWav(frequency, duration, tempFile);
                
                var process = new Process();
                process.StartInfo.FileName = "afplay";
                process.StartInfo.Arguments = $"\"{tempFile}\"";
                process.StartInfo.UseShellExecute = false;
                process.StartInfo.CreateNoWindow = true;
                process.Start();
                
                process.Exited += (sender, e) => {
                    try { System.IO.File.Delete(tempFile); } catch { }
                };
            }
            catch
            {
                Console.Write("\a");
            }
        }

        private void PlayLinuxSound(int frequency, int duration)
        {
            try
            {
                var process = new Process();
                process.StartInfo.FileName = "beep";
                process.StartInfo.Arguments = $"-f {frequency} -l {duration}";
                process.StartInfo.UseShellExecute = false;
                process.StartInfo.CreateNoWindow = true;
                process.Start();
            }
            catch
            {
                try
                {
                    var process = new Process();
                    process.StartInfo.FileName = "timeout";
                    process.StartInfo.Arguments = $"{duration / 1000.0:F1}s speaker-test -t sine -f {frequency} -l 1";
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.CreateNoWindow = true;
                    process.Start();
                }
                catch
                {
                    Console.Write("\a");
                }
            }
        }

        private void CreateToneWav(int frequency, int duration, string filename)
        {
            try
            {
                int sampleRate = 44100;
                int amplitude = 10000;
                double deltaFT = 2 * Math.PI * frequency / sampleRate;
                int numSamples = duration * sampleRate / 1000;

                using (var fileStream = new System.IO.FileStream(filename, System.IO.FileMode.Create))
                using (var writer = new System.IO.BinaryWriter(fileStream))
                {
                    writer.Write(new char[] { 'R', 'I', 'F', 'F' });
                    writer.Write(36 + numSamples * 2);
                    writer.Write(new char[] { 'W', 'A', 'V', 'E' });
                    writer.Write(new char[] { 'f', 'm', 't', ' ' });
                    writer.Write(16);
                    writer.Write((short)1);
                    writer.Write((short)1);
                    writer.Write(sampleRate);
                    writer.Write(sampleRate * 2);
                    writer.Write((short)2);
                    writer.Write((short)16);
                    writer.Write(new char[] { 'd', 'a', 't', 'a' });
                    writer.Write(numSamples * 2);

                    for (int i = 0; i < numSamples; i++)
                    {
                        short sample = (short)(amplitude * Math.Sin(i * deltaFT));
                        writer.Write(sample);
                    }
                }
            }
            catch
            {
            }
        }
    }
}