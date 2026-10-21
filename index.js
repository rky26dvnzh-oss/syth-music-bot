
const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior
} = require("@discordjs/voice");

const { Readable } = require("node:stream");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Play
  }
});

// رابط صوت تجريبي عام
const songUrl =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

client.once("ready", () => {
  console.log(`Syth Music is online as ${client.user.tag}`);
});

client.on("ready", async () => {
  const channelId = process.env.VOICE_CHANNEL_ID;
  const guildId = process.env.GUILD_ID;

  if (!channelId || !guildId) {
    console.log("Set GUILD_ID and VOICE_CHANNEL_ID first.");
    return;
  }

  try {
    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(channelId);

    if (!channel || !channel.isVoiceBased()) {
      console.log("Voice channel not found.");
      return;
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true
    });

    const response = await fetch(songUrl);
    if (!response.ok) throw new Error("Audio could not be loaded");

    const resource = createAudioResource(
      Readable.fromWeb(response.body)
    );

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      console.log("Audio ended.");
    });
  } catch (error) {
    console.error(error);
  }
});

client.login(process.env.DISCORD_TOKEN);
