## Syntax

```abnf
Pattern = Hand ["+" HoraTile] *("+" Fuuro)
Hand = 1*(1*Number Suit)
HoraTile = Number Suit
Fuuro = Minmentsu / Ankan
Minmentsu = 1*Number ("-" / "=" Number) *Number Suit
Ankan = "_" 2Number "_" Suit
Number = "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9" / "0"
Suit = "m" / "p" / "s" / "z"
```
