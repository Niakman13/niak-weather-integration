"""Bubbles and alerts (ported from the card's alerts tests)."""
from engine.alerts import alert_points, theme_of, ticker_points, vigilance_parts
from engine.brief import Brief, Signal


def signal(key: str, group: str, severity: int, text: str | None = None, icon: str = "mdi:weather-sunny") -> Signal:
    return Signal(key, group, severity, text or key, key, icon)


def brief(*signals: Signal) -> Brief:
    return Brief("", "", "", "", "", tuple(signals), (), True)


def test_scrolls_the_points_most_important_first_without_the_official_warning() -> None:
    # Yellow storm vigilance at Gardanne, storm tonight, 72 mm tomorrow, a 5 °C feel gap.
    points = ticker_points(brief(signal("official", "official", 1, "Vigilance jaune · orages"), signal("storm", "future", 2),
                                 signal("rain-future", "future", 1), signal("comfort-gap", "now", 0)))
    assert [p.text for p in points] == ["storm", "rain-future", "comfort-gap"]
    assert [p.label for p in points] == ["À venir", "À venir", "Maintenant"]
    assert [p.level for p in points] == [2, 1, 0]


def test_labels_air_and_pollens_and_keeps_at_most_four_points() -> None:
    points = ticker_points(brief(signal("air-false", "environment", 2), signal("pollen-true", "environment", 1), signal("wind", "now", 1),
                                 signal("storm", "future", 1), signal("pressure", "now", 0)))
    assert len(points) <= 4
    assert next(p for p in points if p.text == "air-false").label == "Air"
    assert ticker_points(brief(signal("pollen-true", "environment", 1)))[0].label == "Pollens"


def test_shows_a_quiet_context_and_nothing_without_a_brief() -> None:
    assert [p.text for p in ticker_points(brief(signal("comfort-gap", "now", 0)))] == ["comfort-gap"]
    assert ticker_points(None) == []


def test_puts_the_vigilance_level_above_its_phenomena() -> None:
    [a] = alert_points(brief(signal("official", "official", 2, "Vigilance orange · orages, vent violent (jaune)")))
    assert (a.level, a.label, a.text, a.official) == (2, "Vigilance orange", "Orages, vent violent (jaune)", True)


def test_without_vigilance_shows_the_point_needing_attention() -> None:
    # 8,2 mm/h measured at Gardanne, no official vigilance.
    alerts = alert_points(brief(signal("comfort-gap", "now", 0), signal("rain-now", "now", 2, "Pluie forte (8,2 mm/h)")))
    assert [(a.level, a.label, a.text, a.official) for a in alerts] == [(2, "Maintenant", "Pluie forte (8,2 mm/h)", False)]
    assert alert_points(brief(signal("comfort-gap", "now", 0))) == []


def test_shows_the_vigilance_and_the_measured_alert_together() -> None:
    alerts = alert_points(brief(signal("rain-now", "now", 2, "Forte pluie : 8,2 mm/h"), signal("official", "official", 1, "Vigilance jaune · orages")))
    assert [a.label for a in alerts] == ["Vigilance jaune", "Maintenant"] and [a.official for a in alerts] == [True, False]


def test_gives_each_point_the_colour_of_its_theme() -> None:
    assert theme_of(signal("rain-now", "now", 1)) == "rain"
    assert theme_of(signal("wind-soft", "now", 0)) == "wind"
    assert theme_of(signal("comfort-gap", "now", 0, icon="mdi:thermometer-low")) == "cold"
    assert theme_of(signal("comfort-gap", "now", 0, icon="mdi:thermometer-high")) == "heat"
    assert theme_of(signal("air-false", "environment", 1)) == "calm"


def test_vigilance_parts() -> None:
    assert vigilance_parts("Vigilance jaune · vent violent") == ("Vigilance jaune", "Vent violent")
    assert vigilance_parts("Vigilance jaune") == (None, "Vigilance jaune")
    assert vigilance_parts("Vent soutenu, rafales à 43,9 km/h") == (None, "Vent soutenu, rafales à 43,9 km/h")


def test_gives_the_vigilance_the_icon_of_its_first_phenomenon() -> None:
    from engine.alerts import phenomenon_icon
    assert [phenomenon_icon(d) for d in ("Orages, vent violent (jaune)", "Neige-verglas", "Vagues-submersion", "Inconnu")] == [
        "mdi:weather-lightning", "mdi:snowflake", "mdi:waves", "mdi:alert-outline"]
