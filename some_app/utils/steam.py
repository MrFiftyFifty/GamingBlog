import requests
from django.conf import settings
from django.utils.timezone import datetime, make_aware


def get_steam_profile(steam_id):
    url = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/"

    params = {
        "key": settings.STEAM_API_KEY,
        "steamids": steam_id
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()

    data = response.json()
    players = data.get("response", {}).get("players", [])

    if not players:
        return None

    player = players[0]

    return {
        "nickname": player.get("personaname", ""),
        "avatar": player.get("avatarfull", "")
    }


def get_owned_games(steam_id):
    url = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"

    params = {
        "key": settings.STEAM_API_KEY,
        "steamid": steam_id,
        "include_appinfo": 1,
        "include_played_free_games": 1,
        "format": "json"
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()

    data = response.json()
    return data.get("response", {}).get("games", [])


def get_user_stats_for_game(steam_id, appid):
    url = "https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/"

    params = {
        "key": settings.STEAM_API_KEY,
        "steamid": steam_id,
        "appid": appid,
        "format": "json"
    }

    try:
        response = requests.get(url, params=params, timeout=10)

        if response.status_code != 200:
            return {}

        data = response.json()
        return data.get("playerstats", {}).get("stats", [])

    except requests.RequestException:
        return {}


def convert_steam_timestamp(timestamp):
    if not timestamp:
        return None

    return make_aware(datetime.fromtimestamp(timestamp))