import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class VidSection extends Section{
  public VidSection(AR it) {
    super(it);
  }

  @Override
  JComponent getContents() {
    return null;
  }

  public JButton getAddButton(AR it) {
    JButton out = new JButton("add video");
    out.addActionListener(new ActionListener() {
      @Override
      public void actionPerformed(ActionEvent e) {
        it.add(new VidSection(it));
      }
    });
    return out;
  }
}
