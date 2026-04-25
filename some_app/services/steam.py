from ..models import SteamGame, UserSteamGame
from ..utils.steam import (
    get_owned_games,
    get_user_stats_for_game,
    convert_steam_timestamp
)


def sync_user_steam_games(user):
    profile = user.profile

    if not profile.steam_id:
        return {
            "synced": 0,
            "detail": "Steam account is not connected"
        }

    games = get_owned_games(profile.steam_id)
    synced_count = 0

    for game_data in games:
        appid = game_data.get("appid")
        name = game_data.get("name", "Unknown game")

        if not appid:
            continue

        icon_hash = game_data.get("img_icon_url", "")
        icon_url = ""

        if icon_hash:
            icon_url = f"https://media.steampowered.com/steamcommunity/public/images/apps/{appid}/{icon_hash}.jpg"

        steam_game, _ = SteamGame.objects.update_or_create(
            appid=appid,
            defaults={
                "name": name,
                "icon_url": icon_url
            }
        )

        stats = get_user_stats_for_game(profile.steam_id, appid)

        UserSteamGame.objects.update_or_create(
            user=user,
            game=steam_game,
            defaults={
                "playtime_forever": game_data.get("playtime_forever", 0),
                "playtime_2weeks": game_data.get("playtime_2weeks", 0),
                "last_played": convert_steam_timestamp(game_data.get("rtime_last_played")),
                "stats": {
                    "raw": stats
                }
            }
        )

        synced_count += 1

    return {
        "synced": synced_count
    }