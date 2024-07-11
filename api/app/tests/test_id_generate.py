from auth.id import obfuscate_serial_number, deobfuscate_serial_number


def test_round_trip():
    serial_number = 1234567890123456789
    obfuscated = obfuscate_serial_number(serial_number)
    deobfuscated = deobfuscate_serial_number(obfuscated)
    assert deobfuscated == serial_number
